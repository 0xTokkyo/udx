/* eslint-disable @typescript-eslint/no-explicit-any */
/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   logger.ts                                            / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 11:24:02 by 0xTokkyo                                    */
/*   Updated: 2025-10-04 20:35:50 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import electronLog from 'electron-log'
import { is } from '@electron-toolkit/utils'

/**
 * @file src/main/core/logger.ts
 * @description Logger utility for the application.
 * @alias main/logger
 */

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

export type LogContext = 'MAIN' | 'PRELOAD' | 'RENDERER'

class UDXLogger {
  private context: LogContext = 'MAIN'

  setContext(context: LogContext): void {
    this.context = context
  }

  getContext(): LogContext {
    return this.context
  }

  private formatMessage(message: string, level: 'info' | 'warn' | 'error' | 'debug'): string {
    const prefix = `${colors.udx}${colors.bright}UDX ${colors.udxBg}${colors.bright} ${this.context} ${colors.reset} ›`

    const levelColors = {
      info: colors.cyan,
      warn: colors.yellow,
      error: colors.red,
      debug: colors.cyan
    }

    return `${prefix} ${levelColors[level]}${message}${colors.reset}`
  }

  info(message: string, ...args: any[]): void {
    if (is.dev) {
      electronLog.info(this.formatMessage(message, 'info'), ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (is.dev) {
      electronLog.warn(this.formatMessage(message, 'warn'), ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (is.dev) {
      electronLog.error(this.formatMessage(message, 'error'), ...args)
    }
  }

  debug(message: string, ...args: any[]): void {
    if (is.dev) {
      electronLog.debug(this.formatMessage(message, 'debug'), ...args)
    }
  }

  main = {
    info: (message: string, ...args: any[]) => {
      this.setContext('MAIN')
      this.info(message, ...args)
    },
    warn: (message: string, ...args: any[]) => {
      this.setContext('MAIN')
      this.warn(message, ...args)
    },
    error: (message: string, ...args: any[]) => {
      this.setContext('MAIN')
      this.error(message, ...args)
    },
    debug: (message: string, ...args: any[]) => {
      this.setContext('MAIN')
      this.debug(message, ...args)
    }
  }

  preload = {
    info: (message: string, ...args: any[]) => {
      this.setContext('PRELOAD')
      this.info(message, ...args)
    },
    warn: (message: string, ...args: any[]) => {
      this.setContext('PRELOAD')
      this.warn(message, ...args)
    },
    error: (message: string, ...args: any[]) => {
      this.setContext('PRELOAD')
      this.error(message, ...args)
    },
    debug: (message: string, ...args: any[]) => {
      this.setContext('PRELOAD')
      this.debug(message, ...args)
    }
  }

  renderer = {
    info: (message: string, ...args: any[]) => {
      this.setContext('RENDERER')
      this.info(message, ...args)
    },
    warn: (message: string, ...args: any[]) => {
      this.setContext('RENDERER')
      this.warn(message, ...args)
    },
    error: (message: string, ...args: any[]) => {
      this.setContext('RENDERER')
      this.error(message, ...args)
    },
    debug: (message: string, ...args: any[]) => {
      this.setContext('RENDERER')
      this.debug(message, ...args)
    }
  }
}

export const logger = new UDXLogger()
export const log = logger
export default logger
