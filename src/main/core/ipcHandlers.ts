/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   ipcHandlers.ts                                       / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 15:04:32 by 0xTokkyo                                    */
/*   Updated: 2025-10-04 20:52:23 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { AppSettings } from '@main/types'
import {
  access,
  closeAllWindows,
  getAppDataPath,
  getAutoEraseAuthToken,
  getModelsDirPath,
  getStore,
  is,
  log,
  readFile,
  readSettings,
  resetGlobalState,
  setIpcHandlersRegistered,
  setStore
} from '@main/core'
import { app, ipcMain, shell } from 'electron'
import path from 'path'

/**
 * @file src/main/core/ipcHandlers.ts
 * @description IPC handlers for main process communication.
 * @alias main/ipcHandlers
 */

export async function registerIpcHandlers(): Promise<void> {
  try {
    log.info('Registering IPC handlers...')

    let store = await getStore()

    // Lazy load electron-store if not already initialized, with encryption.
    if (!store) {
      log.warn('Store is not initialized. Initializing now...')

      try {
        const Store = (await import('electron-store')).default
        const storeEncryptionKey = process.env.VITE_STORAGE_ENCRYPTION_KEY

        if (!storeEncryptionKey) {
          const errMsg = 'VITE_STORAGE_ENCRYPTION_KEY not found in environment variables. Aborting.'
          log.warn(errMsg)
          throw new Error(errMsg)
        }

        store = new Store({
          encryptionKey: storeEncryptionKey || undefined
        })

        setStore(store)
        log.info('Store initialized successfully.')
      } catch (error: Error | unknown) {
        const errMsg = `Failed to initialize store: ${error instanceof Error ? error.message : String(error)}`
        log.error(errMsg)
        throw new Error(errMsg)
      }
    }

    // Auto erase auth token in development mode if configured in #globalState.ts
    if (is.dev && getAutoEraseAuthToken()) store.delete('UdxAppAuthToken')

    /**
     * Get value from electron-store
     * @param {string} key
     * @param {any} property
     */
    ipcMain.handle('electron-store-get', async (_event, key) => {
      log.info('IPC electron-store-get called [', key, ']')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (store as any).get(key)
    })

    /**
     * Set a key-value pair in electron-store
     * @param {string} property
     * @param {any} val
     * @return {any} The value that was set
     */
    ipcMain.handle('electron-store-set', async (_event, property, val) => {
      log.info('IPC electron-store-set called [', property, ']=', val)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(store as any).set(property, val)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (store as any).get(property)
    })

    /**
     * Delete a key from electron-store
     * @param {string} key
     * @return {void}
     */
    ipcMain.handle('electron-store-delete', async (_event, key) => {
      log.info('IPC electron-store-delete called [', key, ']')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(store as any).delete(key as string)
    })

    /**
     * Clear all data in electron-store (use with caution)
     * @returns {void}
     */
    ipcMain.handle('electron-store-clear', async () => {
      log.info('IPC electron-store-clear called')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(store as any).clear()
    })

    /**
     * Set auth token in electron-store (encrypted automatically)
     * @param {string} token
     * @returns {boolean}
     */
    ipcMain.handle('set-auth-token', (_event, token: string): boolean => {
      try {
        if (!token || typeof token !== 'string' || token.length < 10) {
          throw new Error('Invalid token')
        }
        // Store directly - electron-store handles encryption automatically
        store.set('UdxAppAuthToken', token)
        return true
      } catch (error: Error | unknown) {
        const errMsg: string = `Error storing auth token: ${error instanceof Error ? error.message : String(error)}`
        log.error(errMsg)
        return false
      }
    })

    /**
     * Get auth token from electron-store (decrypted automatically)
     * @returns {string | null}
     */
    ipcMain.handle('get-auth-token', (): string | null => {
      log.info('Starting get-auth-token()')
      try {
        // Get directly - electron-store handles decryption automatically
        const token = store.get('UdxAppAuthToken') as string
        return token || null
      } catch (error: Error | unknown) {
        const errMsg: string = `Error retrieving auth token: ${error instanceof Error ? error.message : String(error)}`
        log.error(errMsg)
        return null
      }
    })

    /**
     * Clear auth token from electron-store
     * @returns {boolean}
     */
    ipcMain.handle('clear-auth-token', (): boolean => {
      log.info('IPC clear-auth-token called')
      try {
        store.delete('UdxAppAuthToken')
        closeAllWindows()
        resetGlobalState()
        app.relaunch()
        app.exit(0)
        return true
      } catch (error: Error | unknown) {
        const errMsg: string = `Error clearing auth token: ${error instanceof Error ? error.message : String(error)}`
        log.error(errMsg)
        return false
      }
    })

    /**
     * Open external links in default browser.
     * For security, only allow valid URLs with HTTPS.
     * @param {url} url
     * @returns {void}
     */
    ipcMain.on('open-external-link', (_event, url: URL) => {
      log.info('IPC open-external-link called [', url.href, ']')
      try {
        if (url && typeof url === 'object' && url.protocol === 'https:') {
          // eslint-disable-next-line no-control-regex
          const unsafePattern = /[\u0000-\u001F\u007F-\u009F]/g
          if (unsafePattern.test(url.href)) {
            log.warn('URL contains unsafe characters, aborting openExternal.')
            throw new Error('URL contains unsafe characters')
          }
          log.info(`Opening external link: ${url.href}`)
          shell.openExternal(url.href)
        }
      } catch (error: Error | unknown) {
        const errMsg: string = `Error opening external link: ${error instanceof Error ? error.message : String(error)}`
        log.error(errMsg)
        return
      }
    })

    /**
     * Get app path
     * @returns {string}
     */
    ipcMain.handle('get-app-path', (): string => {
      log.info('IPC get-app-path called')
      return getAppDataPath() as string
    })

    /**
     * Get the local path of the 3D models folder
     * @returns {string}
     */
    ipcMain.handle('get-local-models-folder-path', (): string => {
      log.info('IPC get-local-models-folder-path called')
      return getModelsDirPath() as string
    })

    /**
     * Check if a 3D-model exists in the models directory
     * @param {string} model
     * @returns {string}
     */
    ipcMain.handle('check-model-exists', async (_event, model: string): Promise<boolean> => {
      try {
        const modelsDir = getModelsDirPath()
        if (!modelsDir) {
          log.warn('Models directory not found')
          return false
        }
        const modelPath = path.join(modelsDir, model)
        const exists = await access(modelPath)
          .then(() => true)
          .catch(() => false)
        log.info(`Model ${model} exists: ${exists}`)
        return exists
      } catch (error: Error | unknown) {
        const errMsg: string = `Error checking if model exists: ${error instanceof Error ? error.message : String(error)}`
        log.error(errMsg)
        return false
      }
    })

    /**
     * Read file content
     * @param {string} filePath
     * @returns {Promise<string | null>}
     */
    ipcMain.handle('read-file', async (_event, filePath): Promise<string | null> => {
      log.info('Starting read-file()')
      return new Promise<string | null>((resolve) => {
        readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            const errMsg: string = `Error reading file ${filePath}: ${err.message}`
            log.error(errMsg)
            resolve(null)
            return
          }
          resolve(data)
        })
      })
    })

    /**
     * Read settings from fs
     * @returns {Promise<any>}
     */
    ipcMain.handle('read-settings', async (): Promise<AppSettings | null> => {
      log.info('IPC read-settings called')
      const data = await readSettings()
      return data ? data : null
    })

    /**
     * Write log messages from renderer process
     * @param {'info' | 'warn' | 'error' | 'debug'} type
     * @param {string} message
     * @param {any[]} args
     * @returns {void}
     */
    ipcMain.handle(
      'write-log',
      (
        _event,
        type: 'info' | 'warn' | 'error' | 'debug',
        message: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
      ): boolean => {
        log.renderer[type](message, ...args)
        return true
      }
    )

    /**
     * Restart main process
     * @returns {void}
     */
    ipcMain.on('restart-main-process', (): void => {
      log.info('IPC restart-main-process called')
      app.relaunch()
      app.exit(0)
    })

    // Mark IPC handlers as registered
    setIpcHandlersRegistered(true)

    log.info('IPC handlers registered successfully.')
  } catch (error: Error | unknown) {
    const errMsg = `Failed to register IPC handlers: ${error instanceof Error ? error.message : String(error)}`
    log.error('registerIpcHandlers() - FATAL ERROR:', error)
    log.error('registerIpcHandlers() - Error type:', typeof error)
    log.error('registerIpcHandlers() - Error constructor:', error?.constructor?.name)
    if (error instanceof Error) {
      log.error('registerIpcHandlers() - Error stack:', error.stack)
    }
    throw new Error(errMsg)
  }
}
