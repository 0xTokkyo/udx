#!/usr/bin/env node
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
 * Script to create a new React TSX component in the UDX project structure.
 * The component will be created in the src/renderer/src/components/<folder-name> directory.
 * It generates an index.tsx and index.css file with basic boilerplate code.
 *
 * @argument
 *   1. folder-name: Name of the folder to create the component in (relative to src/components)
 *   2. ComponentName: Name of the UDX React component to create
 * Usage: node mts/create-udx-component.ts <folder-name> <ComponentName>
 * Exemple: node mts/create-udx-component.ts composant-test ComposantTest
 * @author 0xTokkyo
 */

interface ComponentConfig {
  readonly folderName: string
  readonly componentName: string
  readonly componentsDir: string
  readonly targetDir: string
}

interface ComponentResult extends BaseResult {}

enum ComponentErrorCode {
  INVALID_ARGUMENTS = 'INVALID_ARGUMENTS',
  COMPONENTS_DIR_NOT_EXISTS = 'COMPONENTS_DIR_NOT_EXISTS',
  TARGET_DIR_EXISTS = 'TARGET_DIR_EXISTS',
  CREATION_FAILED = 'CREATION_FAILED'
}

function createComponentError(
  code: ComponentErrorCode,
  message: string,
  originalError?: unknown
): BaseError & { code: ComponentErrorCode } {
  return createError(code, message, originalError)
}

const log = createLogger('CREATE-COMPONENT')

function validateArguments(args: readonly string[]): ComponentResult {
  if (args.length < 2) {
    const error = createComponentError(
      ComponentErrorCode.INVALID_ARGUMENTS,
      'Missing required arguments. Usage: <folder-name> <ComponentName>'
    )
    return createErrorResult(error)
  }

  const folderName = args[0]
  const componentName = args[1]

  if (!folderName || !componentName) {
    const error = createComponentError(
      ComponentErrorCode.INVALID_ARGUMENTS,
      'Both folder name and component name are required'
    )
    return createErrorResult(error)
  }

  const sanitizedFolderName = sanitizeForFolderName(folderName)
  if (!sanitizedFolderName) {
    const error = createComponentError(
      ComponentErrorCode.INVALID_ARGUMENTS,
      `Invalid folder name: "${folderName}". Folder name must contain at least one valid character. Suggested name: "valid-folder-name"`
    )
    return createErrorResult(error)
  }

  const pascalCaseName = toPascalCase(componentName)

  if (!isValidComponentName(pascalCaseName)) {
    const error = createComponentError(
      ComponentErrorCode.INVALID_ARGUMENTS,
      `Invalid component name: "${componentName}". Component name must contain only letters and numbers, and start with a capital letter. Suggested name: "${pascalCaseName}"`
    )
    return createErrorResult(error)
  }

  return createSuccessResult('Arguments validation successful')
}

function createComponentConfig(args: readonly string[]): ComponentConfig {
  const folderName = args[0]!
  const componentName = toPascalCase(args[1]!)
  const componentsDir = join(__dirname, '..', 'src', 'renderer', 'src', 'components')
  const targetDir = join(componentsDir, folderName)

  return {
    folderName,
    componentName,
    componentsDir,
    targetDir
  } as const
}

function validateDirectories(config: ComponentConfig): ComponentResult {
  if (!existsSync(config.componentsDir)) {
    const error = createComponentError(
      ComponentErrorCode.COMPONENTS_DIR_NOT_EXISTS,
      `Components directory does not exist: ${config.componentsDir}`
    )
    return createErrorResult(error)
  }

  if (existsSync(config.targetDir)) {
    const error = createComponentError(
      ComponentErrorCode.TARGET_DIR_EXISTS,
      `Target directory already exists: ${config.folderName}`
    )
    return createErrorResult(error)
  }

  return createSuccessResult('Directory validation successful')
}

function generateComponentFiles(config: ComponentConfig): ComponentResult {
  try {
    mkdirSync(config.targetDir, { recursive: true })
    log('info', `Folder created: ${config.folderName}/`)

    const componentName = config.componentName
    const cssClassName = sanitizeForCssClassName(config.folderName)
    const cssFileName = cssClassName

    if (!cssFileName || !cssClassName) {
      throw new Error(
        `Generated CSS names are invalid: fileName="${cssFileName}", className="${cssClassName}"`
      )
    }

    const tsxContent = `import styles from './${cssFileName}.module.css'

const ${componentName} = (): React.JSX.Element => {
  return (
    <>
      <div className={styles.${cssClassName}}></div>
    </>
  )
}

${componentName}.displayName = '${componentName}'

export default ${componentName}
`

    const cssContent = `/* ${componentName} Component */
.${cssClassName} {
  display: flex;
}`

    const tsxPath = join(config.targetDir, 'index.tsx')
    writeFileSync(tsxPath, tsxContent, 'utf8')

    const cssPath = join(config.targetDir, `${cssFileName}.module.css`)
    writeFileSync(cssPath, cssContent, 'utf8')

    return createSuccessResult(
      `Component ${componentName} created successfully in ${config.folderName}/`
    )
  } catch (originalError) {
    const error = createComponentError(
      ComponentErrorCode.CREATION_FAILED,
      `Failed to create component - ${formatErrorMessage(originalError)}`,
      originalError
    )

    return createErrorResult(error)
  }
}

function createComponent(): void {
  const args = process.argv.slice(2)

  log('info', 'Creating React component...')

  const validationResult = validateArguments(args)
  if (!validationResult.success) {
    log('error', validationResult.message)
    process.exit(1)
  }

  const config = createComponentConfig(args)

  const directoryResult = validateDirectories(config)
  if (!directoryResult.success) {
    log('error', directoryResult.message)
    process.exit(1)
  }

  const creationResult = generateComponentFiles(config)
  if (!creationResult.success) {
    log('error', creationResult.message)
    process.exit(1)
  }

  log('info', creationResult.message)
  log('info', 'Component creation complete.')
}

createComponent()
