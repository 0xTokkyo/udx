/**
 * Shared utilities and common code for UDX scripts
 * @author 0xTokkyo
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface BaseResult {
  readonly success: boolean
  readonly message: string
  readonly error?: BaseError
}

export class BaseError extends Error {
  public readonly code: string
  public readonly originalError?: unknown

  constructor(code: string, message: string, originalError?: unknown) {
    super(message)
    this.name = 'BaseError'
    this.code = code
    this.originalError = originalError
  }
}

// ============================================================================
// COLORS AND STYLING
// ============================================================================

export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  udx: '\x1b[38;5;208m',
  udxBg: '\x1b[48;5;208m'
} as const

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

export type LogType = 'info' | 'warn' | 'error'

export function createLogger(scriptName: string) {
  return function log(type: LogType, message: string): void {
    const prefix = `${colors.udx}${colors.bright}UDX ${colors.udxBg}${colors.bright} ${scriptName.toUpperCase()} ${colors.reset}`

    switch (type) {
      case 'info':
        console.info(`${prefix} ${colors.green}${message}${colors.reset}`)
        break
      case 'warn':
        console.warn(`${prefix} ${colors.yellow}${message}${colors.reset}`)
        break
      case 'error':
        console.error(`${prefix} ${colors.red}${message}${colors.reset}`)
        break
    }
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export function createError<T extends string>(
  code: T,
  message: string,
  originalError?: unknown
): BaseError & { code: T } {
  const error = new BaseError(code, message, originalError)
  return error as BaseError & { code: T }
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

// ============================================================================
// RESULT UTILITIES
// ============================================================================

export function createSuccessResult(message: string): BaseResult {
  return {
    success: true,
    message
  }
}

export function createErrorResult(error: BaseError): BaseResult {
  return {
    success: false,
    message: error.message,
    error
  }
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

export function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase())
}

export function sanitizeForFolderName(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\-_\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

export function sanitizeForCssClassName(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/^[^a-zA-Z]+/, '')
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function isValidComponentName(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name)
}
