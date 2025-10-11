/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   globalShortcuts.ts                                   / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 21:16:22 by 0xTokkyo                                    */
/*   Updated: 2025-10-09 18:50:43 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

/**
 * @file src/main/core/globalShortcuts.ts
 * @description Module for managing global keyboard shortcuts.
 */

import { app, BrowserWindow, globalShortcut } from 'electron'
import { is, log } from '@main/core'

export function registerGlobalShortcuts(): void {
  try {
    log.info('Registering global shortcuts...')

    globalShortcut.register('CommandOrControl+W', () => {
      log.info(`Global shortcut CommandOrControl+W triggered. Quitting app.`)
      app.quit()
    })

    globalShortcut.register('F5', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        log.info(`Global shortcut F5 triggered. Reloading focused window.`)
        focusedWindow.reload()
      } else {
        log.info(`Global shortcut F5 triggered. Reloading app.`)
        app.relaunch()
        app.exit()
      }
    })

    globalShortcut.register('F6', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        log.info(`Global shortcut F6 triggered. Maximizing focused window.`)
        focusedWindow.maximize()
      }
    })

    globalShortcut.register('F7', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        log.info(`Global shortcut F7 triggered. Minimizing focused window.`)
        focusedWindow.minimize()
      }
    })

    globalShortcut.register('F8', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        log.info(`Global shortcut F8 triggered. Restoring focused window.`)
        focusedWindow.restore()
      }
    })

    globalShortcut.register('F11', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        log.info(`Global shortcut F11 triggered. Toggling fullscreen for focused window.`)
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    })

    // Developer tools shortcuts, only in development mode ofc.
    if (is.dev) {
      globalShortcut.register('F12', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          log.info(`Global shortcut F12 triggered. Toggling devtools for focused window.`)
          focusedWindow.webContents.toggleDevTools()
        }
      })
    }
  } catch (error: Error | unknown) {
    const errMsg = `Failed to register global shortcuts: ${error instanceof Error ? error.message : 'Unknown error'}`
    log.error(errMsg)
    throw new Error(errMsg)
  }
}

export function unregisterGlobalShortcuts(): void {
  try {
    log.info('Unregistering all global shortcuts...')
    globalShortcut.unregisterAll()
  } catch (error: Error | unknown) {
    const errMsg = `Failed to unregister global shortcuts: ${error instanceof Error ? error.message : 'Unknown error'}`
    log.error(errMsg)
    throw new Error(errMsg)
  }
}
