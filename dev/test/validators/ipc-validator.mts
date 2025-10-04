#!/usr/bin/env node
/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   ipc-validator.mts                                    / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-05 01:19:02 by 0xTokkyo                                    */
/*   Updated: 2025-10-05 01:51:16 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import {
  BaseResult,
  BaseError,
  createLogger,
  createError,
  createSuccessResult,
  createErrorResult
} from '../../mts/u.mts'

/**
 * Script to validate IPC handlers between preload and main process.
 * Checks that all IPC channels used in preload are registered in main.
 * Usage: npm run test:ipc
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface IPCChannel {
  readonly name: string
  readonly type: 'invoke' | 'send'
  readonly location: 'preload' | 'main'
}

enum IPCErrorCode {
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  MISSING_HANDLER = 'MISSING_HANDLER',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

function createIPCError(
  code: IPCErrorCode,
  message: string,
  originalError?: unknown
): BaseError & { code: IPCErrorCode } {
  return createError(code, message, originalError)
}

const log = createLogger('TEST-IPC')

export function extractIPCChannelsFromPreload(content: string): IPCChannel[] {
  const channels: IPCChannel[] = []

  // Regex pour ipcRenderer.invoke
  const invokeRegex = /ipcRenderer\.invoke\(['"`]([^'"`]+)['"`]/g
  let match

  while ((match = invokeRegex.exec(content)) !== null) {
    channels.push({
      name: match[1],
      type: 'invoke',
      location: 'preload'
    })
  }

  // Regex pour ipcRenderer.send
  const sendRegex = /ipcRenderer\.send\(['"`]([^'"`]+)['"`]/g

  while ((match = sendRegex.exec(content)) !== null) {
    channels.push({
      name: match[1],
      type: 'send',
      location: 'preload'
    })
  }

  return channels
}

export function extractIPCHandlersFromMain(content: string): IPCChannel[] {
  const handlers: IPCChannel[] = []

  // Regex pour ipcMain.handle - avec support des sauts de ligne et espaces
  const handleRegex = /ipcMain\.handle\(\s*['"`]([^'"`]+)['"`]/g
  let match

  while ((match = handleRegex.exec(content)) !== null) {
    handlers.push({
      name: match[1],
      type: 'invoke',
      location: 'main'
    })
  }

  // Regex pour ipcMain.on - multiligne supported
  const onRegex = /ipcMain\.on\(\s*['"`]([^'"`]+)['"`]/g

  while ((match = onRegex.exec(content)) !== null) {
    handlers.push({
      name: match[1],
      type: 'send',
      location: 'main'
    })
  }

  return handlers
}

export function readFileContent(filePath: string): BaseResult & { content?: string } {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return {
      ...createSuccessResult('File read successfully'),
      content
    }
  } catch (originalError) {
    const error = createIPCError(
      IPCErrorCode.FILE_READ_ERROR,
      `Failed to read file: ${filePath}`,
      originalError
    )
    return createErrorResult(error)
  }
}

export function validateIPCChannels(
  preloadChannels: IPCChannel[],
  mainHandlers: IPCChannel[]
): BaseResult {
  const missingHandlers: string[] = []
  const typeMismatches: string[] = []

  // Dédupliquer les canaux pour éviter les doublons dans le rapport
  const uniqueChannels = Array.from(
    new Map(preloadChannels.map((ch) => [`${ch.name}-${ch.type}`, ch])).values()
  )

  for (const channel of uniqueChannels) {
    const handler = mainHandlers.find((h) => h.name === channel.name)

    if (!handler) {
      missingHandlers.push(`${channel.name} (${channel.type})`)
    } else if (handler.type !== channel.type) {
      typeMismatches.push(
        `${channel.name}: preload uses '${channel.type}' but main uses '${handler.type}'`
      )
    }
  }

  if (missingHandlers.length > 0 || typeMismatches.length > 0) {
    let message = 'IPC validation failed:\n'

    if (missingHandlers.length > 0) {
      message += `\nMissing handlers in main:\n  - ${missingHandlers.join('\n  - ')}`
    }

    if (typeMismatches.length > 0) {
      message += `\n\nType mismatches:\n  - ${typeMismatches.join('\n  - ')}`
    }

    const error = createIPCError(IPCErrorCode.MISSING_HANDLER, message)
    return createErrorResult(error)
  }

  return createSuccessResult('All IPC channels are properly registered')
}

export async function testIPC(): Promise<BaseResult> {
  log('info', 'Testing IPC channels...')

  const preloadPath = join(__dirname, '..', '..', '..', 'src', 'preload', 'index.ts')
  const mainPath = join(__dirname, '..', '..', '..', 'src', 'main', 'core', 'ipcHandlers.ts')

  log('info', `Reading preload file: ${preloadPath}`)
  const preloadResult = readFileContent(preloadPath)
  if (!preloadResult.success || !preloadResult.content) {
    log('error', preloadResult.message)
    process.exit(1)
  }

  log('info', `Reading main file: ${mainPath}`)
  const mainResult = readFileContent(mainPath)
  if (!mainResult.success || !mainResult.content) {
    log('error', mainResult.message)
    process.exit(1)
  }

  log('info', 'Extracting IPC channels from preload...')
  const preloadChannels = extractIPCChannelsFromPreload(preloadResult.content)
  log('info', `Found ${preloadChannels.length} IPC channels in preload`)

  const uniquePreloadChannels = Array.from(
    new Map(preloadChannels.map((ch) => [`${ch.name}-${ch.type}`, ch])).values()
  )
  log('info', '')
  log('info', 'Preload channels:')
  uniquePreloadChannels.forEach((channel) => {
    log('info', `  - ${channel.name} (${channel.type})`)
  })

  log('info', '')
  log('info', 'Extracting IPC handlers from main...')
  const mainHandlers = extractIPCHandlersFromMain(mainResult.content)
  log('info', `Found ${mainHandlers.length} IPC handlers in main`)

  const uniqueMainHandlers = Array.from(
    new Map(mainHandlers.map((h) => [`${h.name}-${h.type}`, h])).values()
  )
  log('info', '')
  log('info', 'Main handlers:')
  uniqueMainHandlers.forEach((handler) => {
    log('info', `  - ${handler.name} (${handler.type})`)
  })

  log('info', '')
  log('info', 'Validating IPC channels...')
  const validationResult = validateIPCChannels(preloadChannels, mainHandlers)

  if (!validationResult.success) {
    log('error', validationResult.message)
    process.exit(1)
  }

  log('info', validationResult.message)
  log('info', '')
  log('info', 'IPC Channels Summary:')

  const uniqueChannels = [...new Set(preloadChannels.map((c) => c.name))]
  uniqueChannels.forEach((channelName) => {
    const channel = preloadChannels.find((c) => c.name === channelName)!
    log('info', `  ✓ ${channelName} (${channel.type})`)
  })

  log('info', '')
  log('info', 'IPC validation complete.')
  return Promise.resolve({ success: true, message: 'IPC validation passed' } as BaseResult)
}
