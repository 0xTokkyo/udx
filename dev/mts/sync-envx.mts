#!/usr/bin/env node
/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   sync-envx.mts                                        / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 12:07:14 by 0xTokkyo                                    */
/*   Updated: 2025-10-04 12:07:22 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { copyFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'
import {
  BaseResult,
  BaseError,
  createLogger,
  createError,
  createSuccessResult,
  createErrorResult,
  formatErrorMessage
} from './u.mjs'

/**
 * Script to sync and re-encrypt the .env.production file from the .env file using dotenvx.
 * It copies the .env file to .env.production and then re-encrypts it.
 * The script assumes that dotenvx is installed as a dev dependency in the project.
 *
 * Usage: node mts/sync-envx.ts
 */

interface SyncConfig {
  readonly envDir: string
  readonly sourceFile: string
  readonly targetFile: string
  readonly encryptCommand: string
}

interface SyncResult extends BaseResult {}

enum SyncErrorCode {
  ENV_FILE_MISSING = 'ENV_FILE_MISSING',
  COPY_FAILED = 'COPY_FAILED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED'
}

const CONFIG: SyncConfig = {
  envDir: './env',
  sourceFile: '.env',
  targetFile: '.env.production',
  encryptCommand: 'npx dotenvx encrypt -f'
} as const

function createSyncError(
  code: SyncErrorCode,
  message: string,
  originalError?: unknown
): BaseError & { code: SyncErrorCode } {
  return createError(code, message, originalError)
}

const log = createLogger('SYNC-ENVX')

function validateEnvironmentFile(config: SyncConfig): SyncResult {
  const envFilePath = join(config.envDir, config.sourceFile)

  if (!existsSync(envFilePath)) {
    const error = createSyncError(
      SyncErrorCode.ENV_FILE_MISSING,
      `.env file is missing in ${config.envDir} folder. Please create it.`
    )
    return createErrorResult(error)
  }

  return createSuccessResult('Environment file validation successful')
}

function syncEnvironmentFile(config: SyncConfig): SyncResult {
  try {
    const sourcePath = join(config.envDir, config.sourceFile)
    const targetPath = join(config.envDir, config.targetFile)

    copyFileSync(sourcePath, targetPath)

    return createSuccessResult(`${config.targetFile} synced successfully.`)
  } catch (originalError) {
    const error = createSyncError(
      SyncErrorCode.COPY_FAILED,
      `Failed to sync ${config.sourceFile} to ${config.targetFile} - ${formatErrorMessage(originalError)}`,
      originalError
    )

    return createErrorResult(error)
  }
}

function encryptEnvironmentFile(config: SyncConfig): SyncResult {
  try {
    const targetPath = join(config.envDir, config.targetFile)
    const command = `${config.encryptCommand} ${targetPath}`

    log('info', `Encrypting ${targetPath} in progress...`)
    execSync(command, { stdio: 'inherit' })

    return createSuccessResult(`${config.targetFile} re-encrypted successfully.`)
  } catch (originalError) {
    const error = createSyncError(
      SyncErrorCode.ENCRYPTION_FAILED,
      `Failed to re-encrypt ${config.targetFile} - ${formatErrorMessage(originalError)}`,
      originalError
    )

    return createErrorResult(error)
  }
}

function syncEnvironmentFiles(): void {
  log('info', 'Syncing env.x')

  const validationResult = validateEnvironmentFile(CONFIG)
  if (!validationResult.success) {
    log('error', validationResult.message)
    process.exit(1)
  }

  const syncResult = syncEnvironmentFile(CONFIG)
  if (!syncResult.success) {
    log('error', syncResult.message)
    process.exit(1)
  }
  log('info', syncResult.message)

  const encryptResult = encryptEnvironmentFile(CONFIG)
  if (!encryptResult.success) {
    log('error', encryptResult.message)
    process.exit(1)
  }
  log('info', encryptResult.message)
  log('info', 'Synchronization complete.')
}

syncEnvironmentFiles()
