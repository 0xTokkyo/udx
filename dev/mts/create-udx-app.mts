#!/usr/bin/env node
/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   create-udx-app.mts                                   / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 12:06:58 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 11:40:03 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import {
  BaseResult,
  BaseError,
  createLogger,
  createError,
  createSuccessResult,
  createErrorResult,
  formatErrorMessage,
  toPascalCase,
  sanitizeForFolderName,
  sanitizeForCssClassName,
  isValidComponentName
} from './u.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Script to create a new React TSX app in the UDX project structure.
 * The component will be created in the src/renderer/src/app/<folder-name> directory.
 * It generates an index.tsx and index.css file with basic boilerplate code.
 *
 * @argument
 *   1. folder-name: Name of the folder to create the app in (relative to src/apps)
 *   2. AppName: Name of the UDX React app to create
 * Usage: node mts/create-udx-app.ts <folder-name> <AppName>
 * Exemple: node mts/create-udx-app.ts composant-test ComposantTest
 */

interface AppConfig {
  readonly folderName: string
  readonly appName: string
  readonly appsDir: string
  readonly targetDir: string
}

interface AppResult extends BaseResult {}

enum AppErrorCode {
  INVALID_ARGUMENTS = 'INVALID_ARGUMENTS',
  APP_DIR_NOT_EXISTS = 'APP_DIR_NOT_EXISTS',
  TARGET_DIR_EXISTS = 'TARGET_DIR_EXISTS',
  CREATION_FAILED = 'CREATION_FAILED'
}

function createAppError(
  code: AppErrorCode,
  message: string,
  originalError?: unknown
): BaseError & { code: AppErrorCode } {
  return createError(code, message, originalError)
}

const log = createLogger('CREATE-APP')

function validateArguments(args: readonly string[]): AppResult {
  if (args.length < 2) {
    const error = createAppError(
      AppErrorCode.INVALID_ARGUMENTS,
      'Missing required arguments. Usage: <folder-name> <appName>'
    )
    return createErrorResult(error)
  }

  const folderName = args[0]
  const appName = args[1]

  if (!folderName || !appName) {
    const error = createAppError(
      AppErrorCode.INVALID_ARGUMENTS,
      'Both folder name and app name are required'
    )
    return createErrorResult(error)
  }

  const sanitizedFolderName = sanitizeForFolderName(folderName)
  if (!sanitizedFolderName) {
    const error = createAppError(
      AppErrorCode.INVALID_ARGUMENTS,
      `Invalid folder name: "${folderName}". Folder name must contain at least one valid character. Suggested name: "valid-folder-name"`
    )
    return createErrorResult(error)
  }

  const pascalCaseName = toPascalCase(appName)

  if (!isValidComponentName(pascalCaseName)) {
    const error = createAppError(
      AppErrorCode.INVALID_ARGUMENTS,
      `Invalid app name: "${appName}". App name must contain only letters and numbers, and start with a capital letter. Suggested name: "${pascalCaseName}"`
    )
    return createErrorResult(error)
  }

  return createSuccessResult('Arguments validation successful')
}

function createAppConfig(args: readonly string[]): AppConfig {
  const folderName = args[0]!
  const appName = toPascalCase(args[1]!)
  const appsDir = join(__dirname, '..', '..', 'src', 'renderer', 'src', 'apps')
  const targetDir = join(appsDir, folderName)

  return {
    folderName,
    appName,
    appsDir,
    targetDir
  } as const
}

function validateDirectories(config: AppConfig): AppResult {
  if (!existsSync(config.appsDir)) {
    const error = createAppError(
      AppErrorCode.APP_DIR_NOT_EXISTS,
      `Apps directory does not exist: ${config.appsDir}`
    )
    return createErrorResult(error)
  }

  if (existsSync(config.targetDir)) {
    const error = createAppError(
      AppErrorCode.TARGET_DIR_EXISTS,
      `Target directory already exists: ${config.folderName}`
    )
    return createErrorResult(error)
  }

  return createSuccessResult('Directory validation successful')
}

function generateAppFiles(config: AppConfig): AppResult {
  try {
    mkdirSync(config.targetDir, { recursive: true })
    log('info', `Folder created: ${config.folderName}/`)

    const appName = config.appName
    const cssClassName = sanitizeForCssClassName(config.folderName)
    const cssFileName = cssClassName

    if (!cssFileName || !cssClassName) {
      throw new Error(
        `Generated CSS names are invalid: fileName="${cssFileName}", className="${cssClassName}"`
      )
    }

    // Create assets folder
    const assetsDir = join(config.targetDir, 'assets')
    mkdirSync(assetsDir, { recursive: true })
    log('info', `Assets folder created: ${config.folderName}/assets/`)

    // Create locales folder
    const localesDir = join(config.targetDir, 'locales')
    mkdirSync(localesDir, { recursive: true })
    log('info', `Locales folder created: ${config.folderName}/locales/`)

    // Create locale files
    const locales = ['en', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
    const localeContent = `{
  "${appName}": {
    "app_title": "Application Title",
    "welcome_message": "Welcome to ${appName}",
    "hello_world": "Hello World."
  }
}
`

    locales.forEach((locale) => {
      const localePath = join(localesDir, `${locale}.json`)
      writeFileSync(localePath, localeContent, 'utf8')
    })
    log('info', `Locale files created: ${locales.map((l) => `${l}.json`).join(', ')}`)

    const tsxContent = `import React from 'react'
import './index.css'

/**
 * @file src/renderer/src/apps/${appName}/index.tsx
 * @description ${appName} - UDX Application
 */

const ${appName} = (): React.JSX.Element => {
  return (
    <>
      <div id="${appName}">Welcome, ${appName}.</div>
    </>
  )
}

${appName}.displayName = '${appName}'

export default ${appName}
`

    const cssContent = `/* ${appName}.css */`

    const tsxPath = join(config.targetDir, 'index.tsx')
    writeFileSync(tsxPath, tsxContent, 'utf8')

    const cssPath = join(config.targetDir, 'index.css')
    writeFileSync(cssPath, cssContent, 'utf8')

    return createSuccessResult(`App ${appName} created successfully in ${config.folderName}/`)
  } catch (originalError) {
    const error = createAppError(
      AppErrorCode.CREATION_FAILED,
      `Failed to create app - ${formatErrorMessage(originalError)}`,
      originalError
    )

    return createErrorResult(error)
  }
}

function createApp(): void {
  const args = process.argv.slice(2)

  log('info', 'Creating React app...')

  const validationResult = validateArguments(args)
  if (!validationResult.success) {
    log('error', validationResult.message)
    process.exit(1)
  }

  const config = createAppConfig(args)

  const directoryResult = validateDirectories(config)
  if (!directoryResult.success) {
    log('error', directoryResult.message)
    process.exit(1)
  }

  const creationResult = generateAppFiles(config)
  if (!creationResult.success) {
    log('error', creationResult.message)
    process.exit(1)
  }

  log('info', creationResult.message)
  log('info', 'App creation complete.')
}

createApp()
