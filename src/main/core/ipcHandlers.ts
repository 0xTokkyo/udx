/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   ipcHandlers.ts                                       / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 15:04:32 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 12:14:56 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { AppSettings } from '@main/types'
import {
  access,
  closeAllWindows,
  closeWindow,
  createDefaultSettings,
  getAllWindows,
  getAppDataPath,
  getAutoEraseAuthToken,
  getModelsDirPath,
  getStore,
  is,
  log,
  maximizeWindow,
  minimizeWindow,
  readFile,
  readSettings,
  resetGlobalState,
  setIpcHandlersRegistered,
  setStore,
  writeSettings
} from '@main/core'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'

/**
 * @file src/main/core/ipcHandlers.ts
 * @description IPC handlers for main process communication.
 * @alias main/ipcHandlers
 */

export async function registerIpcHandlers(): Promise<void> {
  try {
    log.main.info('Registering IPC handlers...')

    let store = await getStore()

    // Lazy load electron-store if not already initialized, with encryption.
    if (!store) {
      log.debug('Store is not initialized. Initializing now...')

      try {
        const Store = (await import('electron-store')).default
        const storeEncryptionKey = process.env.VITE_STORAGE_ENCRYPTION_KEY

        if (!storeEncryptionKey) {
          const errMsg = 'VITE_STORAGE_ENCRYPTION_KEY not found in environment variables. Aborting.'
          log.main.warn(errMsg)
          throw new Error(errMsg)
        }

        store = new Store({
          encryptionKey: storeEncryptionKey || undefined
        })

        setStore(store)
        log.main.info('Store initialized successfully.')
      } catch (error: Error | unknown) {
        const errMsg = `Failed to initialize store: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
        throw new Error(errMsg)
      }
    }

    // Auto erase auth token in development mode if configured in #globalState.ts
    if (is.dev && getAutoEraseAuthToken()) store.delete(import.meta.env.VITE_AUTH_TOKEN)

    /**
     * Get value from electron-store
     * @param {string} key
     * @param {any} property
     */
    ipcMain.handle('electron-store-get', async (_event, key) => {
      log.main.info('IPC electron-store-get called [', key, ']')
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
      log.main.info('IPC electron-store-set called [', property, ']=', val)
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
      log.main.info('IPC electron-store-delete called [', key, ']')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(store as any).delete(key as string)
    })

    /**
     * Clear all data in electron-store (use with caution)
     * @returns {void}
     */
    ipcMain.handle('electron-store-clear', async () => {
      log.main.info('IPC electron-store-clear called')
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
        store.set(import.meta.env.VITE_AUTH_TOKEN, token)
        return true
      } catch (error: Error | unknown) {
        const errMsg: string = `Error storing auth token: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
        return false
      }
    })

    /**
     * Get auth token from electron-store (decrypted automatically)
     * @returns {string | null}
     */
    ipcMain.handle('get-auth-token', (): string | null => {
      log.main.info('Starting get-auth-token()')
      try {
        // Get directly - electron-store handles decryption automatically
        const token = store.get(import.meta.env.VITE_AUTH_TOKEN) as string
        return token || null
      } catch (error: Error | unknown) {
        const errMsg: string = `Error retrieving auth token: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
        return null
      }
    })

    /**
     * Clear auth token from electron-store
     * @returns {boolean}
     */
    ipcMain.handle('clear-auth-token', (): boolean => {
      log.main.info('IPC clear-auth-token called')
      try {
        store.delete(import.meta.env.VITE_AUTH_TOKEN)
        closeAllWindows()
        resetGlobalState()
        app.relaunch()
        app.exit(0)
        return true
      } catch (error: Error | unknown) {
        const errMsg: string = `Error clearing auth token: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
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
      log.main.info('IPC open-external-link called [', url.href, ']')
      try {
        if (url && typeof url === 'object' && url.protocol === 'https:') {
          // eslint-disable-next-line no-control-regex
          const unsafePattern = /[\u0000-\u001F\u007F-\u009F]/g
          if (unsafePattern.test(url.href)) {
            log.main.warn('URL contains unsafe characters, aborting openExternal.')
            throw new Error('URL contains unsafe characters')
          }
          log.main.info(`Opening external link: ${url.href}`)
          shell.openExternal(url.href)
        }
      } catch (error: Error | unknown) {
        const errMsg: string = `Error opening external link: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
        return
      }
    })

    /**
     * Get app path
     * @returns {string}
     */
    ipcMain.handle('get-app-path', (): string => {
      log.main.info('IPC get-app-path called')
      return getAppDataPath() as string
    })

    /**
     * Get the local path of the 3D models folder
     * @returns {string}
     */
    ipcMain.handle('get-local-models-folder-path', (): string => {
      log.main.info('IPC get-local-models-folder-path called')
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
          log.main.warn('Models directory not found')
          return false
        }
        const modelPath = path.join(modelsDir, model)
        const exists = await access(modelPath)
          .then(() => true)
          .catch(() => false)
        log.main.info(`Model ${model} exists: ${exists}`)
        return exists
      } catch (error: Error | unknown) {
        const errMsg: string = `Error checking if model exists: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
        return false
      }
    })

    /**
     * Read file content
     * @param {string} filePath
     * @returns {Promise<string | null>}
     */
    ipcMain.handle('read-file', async (_event, filePath): Promise<string | null> => {
      log.main.info('Starting read-file()')
      return new Promise<string | null>((resolve) => {
        readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            const errMsg: string = `Error reading file ${filePath}: ${err.message}`
            log.main.error(errMsg)
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
      log.main.info('IPC read-settings called')
      const data = await readSettings()
      return data ? data : null
    })

    /**
     * Write settings to fs
     * @param {AppSettings} settings
     * @returns {Promise<boolean>}
     */
    ipcMain.handle('write-settings', async (_event, settings: AppSettings): Promise<boolean> => {
      log.main.info('IPC write-settings called')
      try {
        await writeSettings(settings)
        return true
      } catch (error: Error | unknown) {
        const errMsg: string = `Error writing settings: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
        return false
      }
    })

    /**
     * Create default settings
     * @returns {Promise<AppSettings | null>}
     */
    ipcMain.handle('create-default-settings', async (): Promise<AppSettings | null> => {
      log.main.info('IPC create-default-settings called')
      try {
        await createDefaultSettings()
        return await readSettings()
      } catch (error: Error | unknown) {
        const errMsg: string = `Error creating default settings: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
        return null
      }
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
      log.main.info('IPC restart-main-process called')
      app.relaunch()
      app.exit(0)
    })

    /**
     * Close window - called from FrameController.tsx
     * @returns {void}
     */
    ipcMain.on('close-window', (event): void => {
      log.main.info('IPC close-window called')
      try {
        const senderWindow = BrowserWindow.fromWebContents(event.sender)
        if (senderWindow) {
          // Find the window metadata by matching the BrowserWindow instance
          const allWindows = getAllWindows()
          for (const metadata of allWindows) {
            if (metadata.window === senderWindow) {
              closeWindow(metadata.id)

              const remainingWindows = getAllWindows()
              if (remainingWindows.length === 0) {
                log.main.info('Last window closed, quitting application')
                app.quit()
              }
              return
            }
          }
          log.main.warn('Window metadata not found, closing window directly')
          senderWindow.close()

          const remainingWindows = getAllWindows()
          if (remainingWindows.length === 0) {
            log.main.info('Last window closed, quitting application')
            app.quit()
          }
        }
      } catch (error: Error | unknown) {
        const errMsg = `Error closing window: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
      }
    })

    /**
     * Minimize window - called from FrameController.tsx
     * @returns {void}
     */
    ipcMain.on('minimize-window', (event): void => {
      log.main.info('IPC minimize-window called')
      try {
        const senderWindow = BrowserWindow.fromWebContents(event.sender)
        if (senderWindow) {
          // Find the window metadata by matching the BrowserWindow instance
          const allWindows = getAllWindows()
          for (const metadata of allWindows) {
            if (metadata.window === senderWindow) {
              minimizeWindow(metadata.id)
              return
            }
          }
          log.main.warn('Window metadata not found, minimizing window directly')
          senderWindow.minimize()
        }
      } catch (error: Error | unknown) {
        const errMsg = `Error minimizing window: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
      }
    })

    /**
     * Maximize window - called from FrameController.tsx
     * @returns {void}
     */
    ipcMain.on('maximize-window', (event): void => {
      log.main.info('IPC maximize-window called')
      try {
        const senderWindow = BrowserWindow.fromWebContents(event.sender)
        if (senderWindow) {
          // Find the window metadata by matching the BrowserWindow instance
          const allWindows = getAllWindows()
          for (const metadata of allWindows) {
            if (metadata.window === senderWindow) {
              maximizeWindow(metadata.id)
              return
            }
          }
          log.main.warn('Window metadata not found, maximizing window directly')
          if (senderWindow.isMaximized()) {
            senderWindow.unmaximize()
          } else {
            senderWindow.maximize()
          }
        }
      } catch (error: Error | unknown) {
        const errMsg = `Error maximizing window: ${error instanceof Error ? error.message : String(error)}`
        log.main.error(errMsg)
      }
    })

    // IPC handlers are registered
    setIpcHandlersRegistered(true)

    log.main.info('IPC handlers registered successfully.')
  } catch (error: Error | unknown) {
    const errMsg = `Failed to register IPC handlers: ${error instanceof Error ? error.message : String(error)}`
    log.main.error('registerIpcHandlers() - FATAL ERROR:', error)
    log.main.error('registerIpcHandlers() - Error type:', typeof error)
    log.main.error('registerIpcHandlers() - Error constructor:', error?.constructor?.name)
    if (error instanceof Error) {
      log.main.error('registerIpcHandlers() - Error stack:', error.stack)
    }
    throw new Error(errMsg)
  }
}
