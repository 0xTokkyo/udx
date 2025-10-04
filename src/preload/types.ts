/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   types.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-05 00:59:10 by 0xTokkyo                                    */
/*   Updated: 2025-10-05 01:08:34 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @interface CustomElectronAPI
 * @description Type-safe API for IPC communication between renderer and main process
 */
export interface CustomElectronAPI {
  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => void
  send: (channel: string, ...args: any[]) => void

  // External links
  openExternalLink: (url: string) => void

  // Electron Store operations
  store: {
    get: (key: string) => Promise<any>
    set: (property: string, value: any) => Promise<any>
    delete: (key: string) => Promise<void>
    clear: () => Promise<void>
  }

  // Auth token management
  auth: {
    setToken: (token: string) => Promise<boolean>
    getToken: () => Promise<string | null>
    clearToken: () => Promise<boolean>
  }

  // App paths
  paths: {
    getAppPath: () => Promise<string>
    getLocalModelsPath: () => Promise<string>
  }

  // Models
  models: {
    checkExists: (model: string) => Promise<boolean>
  }

  // File operations
  file: {
    read: (filePath: string) => Promise<string | null>
    readSettings: () => Promise<any | null>
  }

  // Logging
  log: {
    info: (message: string, ...args: any[]) => Promise<boolean>
    warn: (message: string, ...args: any[]) => Promise<boolean>
    error: (message: string, ...args: any[]) => Promise<boolean>
    debug: (message: string, ...args: any[]) => Promise<boolean>
  }

  // App control
  app: {
    restart: () => void
  }
}
