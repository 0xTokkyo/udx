/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 02:46:27 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 12:17:37 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { app } from 'electron'
import {
  loadEncryptedEnvx,
  log,
  initializeAppData,
  registerIpcHandlers,
  createTray,
  createWindow,
  getAllWindows,
  unregisterGlobalShortcuts
} from '@main/core'
import { initializeProtocols, setDiscordActivity, performHealthChecks } from '@main/services'

/**
 * @file src/main/index.ts
 * @description Main entry point for the application.
 */

async function initializeMainProcess(): Promise<void> {
  try {
    log.setContext('MAIN')

    /**
     * Load encrypted environment variables with dotenvx
     * @returns {Promise<void>}
     */
    await loadEncryptedEnvx()

    /**
     * Ensure the development or live server is running
     * @description This function checks if the appropriate server is running based on the environment.
     * If the server is not running, it logs an error and exits the application.
     * This prevents the application from encountering runtime errors.
     * @see {@link https://github.com/0xTokkyo/udx-server UDX Server}
     * @returns {Promise<void>}
     */
    await performHealthChecks()

    /**
     * Initialize application data and settings
     * @returns {Promise<void>}
     */
    await initializeAppData()

    /**
     * Initialize custom protocol handlers
     * @returns {Promise<void>}
     */
    await initializeProtocols()

    /**
     * Register IPC handlers
     * @returns {Promise<void>}
     */
    await registerIpcHandlers()

    /**
     * Create the first application window
     */
    await createWindow({ type: 'main', rendererHTMLFile: 'index' })

    /**
     * Set up the system tray
     * @returns {Promise<void>}
     */
    await createTray()

    /**
     * Set Discord Rich Presence activity
     * @returns {Promise<void>}
     */
    await setDiscordActivity()

    log.main.info('UDX is starting.')
  } catch (error: Error | unknown) {
    log.main.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

/**
 * Handle application lifecycle events : window-all-closed
 * @returns {void}
 */
app.on('window-all-closed', function (): void {
  // Always quit the app when all windows are closed, including on macOS
  if (getAllWindows().length === 0) {
    log.main.info('All windows closed, quitting application')
    app.quit()
  }
})

/**
 * Handle application lifecycle events : before-quit
 * @returns {void}
 */
app.on('before-quit', (): void => {
  try {
    if (app.isReady()) {
      unregisterGlobalShortcuts()
    }
  } catch (error: Error | unknown) {
    const errMsg: string = `app.on(before-quit) => Error: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
  }
})

/**
 * Handle application lifecycle events : will-quit
 * @returns {void}
 */
app.on('will-quit', (): void => {
  try {
    if (app.isReady()) {
      unregisterGlobalShortcuts()
    }
  } catch (error: Error | unknown) {
    const errMsg: string = `app.on(will-quit) => Error: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
  }
})

/**
 * Handle application lifecycle events : second-instance
 * @returns {void}
 */
app.on('second-instance', (): void => {
  if (getAllWindows().length === 0) {
    createWindow({ type: 'main', rendererHTMLFile: 'index' })
  }
})

/**
 * App UDX is now ready to start. We ensure a single instance lock and start main process
 * @returns {void}
 */
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.whenReady().then(() => {
    initializeMainProcess()
  })
}
