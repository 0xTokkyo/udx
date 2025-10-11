/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   tray.ts                                              / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 19:06:01 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 12:14:38 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { Menu, Tray, app, nativeImage } from 'electron'
import {
  log,
  getTray,
  setTray,
  showAllWindows,
  setTrayContextMenu,
  getTrayContextMenu,
  createWindow,
  getIsQuitting,
  userIsLoggedIn
} from '@main/core'
import path from 'path'

/**
 * @file src/main/core/tray.ts
 * @description System tray management.
 */

// CONSTANTS
const TRAY_ICON_PATH = path.join(
  __dirname,
  '../../resources/icons',
  'udx-icons-multisize',
  'udx-icon-16.png'
)

/**
 * Create and return an Electron Tray instance.
 * @returns {Promise<Tray>} Electron Tray instance
 */
export async function createTray(): Promise<Tray> {
  try {
    log.main.info('Creating Tray instance...')

    let tray: Tray | null = getTray()

    const userLoggedIn = userIsLoggedIn()

    if (!tray) {
      log.main.info('Creating new tray instance.')
      tray = new Tray(TRAY_ICON_PATH)

      const contextMenu = Menu.buildFromTemplate([
        {
          label: `Uxon Dynamics ${app.getVersion()}`,
          enabled: false,
          icon: nativeImage.createFromPath(TRAY_ICON_PATH).resize({ width: 16, height: 16 })
        },
        { type: 'separator' },
        {
          label: 'New UDX Window',
          enabled: userLoggedIn,
          click: async () => {
            if (getIsQuitting() || !userLoggedIn) {
              log.main.warn('App is quitting or user is not logged in, not creating new window.')
              return
            }
            await createWindow({ type: 'main', rendererHTMLFile: 'index' })
          }
        }
      ])
      tray.setToolTip('Uxon Dynamics')
      tray.setContextMenu(contextMenu)

      //? We set the context menu, yes, but we need to save it to global state too.
      //? This is because Electron does not provide a way to get the current context menu
      //? from the Tray instance, so we need to manage it ourselves like a pseudo
      //? Electron.Tray.getTrayContextMenu(). Maybe remove this in the future.
      setTrayContextMenu(contextMenu)
      setTray(tray)

      tray.on('click', () => {
        showAllWindows()
      })

      return tray
    } else {
      log.main.info('Tray already exists, returning existing instance.')
      return tray
    }
  } catch (error: Error | unknown) {
    const errMsg = `Failed to create tray: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    throw new Error(errMsg)
  }
}

/**
 * Destroy the existing tray instance if it exists.
 * @returns {void}
 */
export function destroyTray(): void {
  try {
    const tray = getTray()
    if (tray) {
      log.main.warn('Destroying tray instance.')
      tray.destroy()
      setTray(null)
    } else {
      log.main.info('No tray instance to destroy.')
    }
  } catch (error: Error | unknown) {
    const errMsg = `Failed to destroy tray: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    throw new Error(errMsg)
  }
}

/**
 * Update the tray icon.
 * @param iconPath - Path to the new icon image
 * @returns {void}
 */
export function updateTrayIcon(iconPath: string): void {
  try {
    const tray = getTray()
    if (tray) {
      log.main.info('Updating tray icon.')
      const newIcon = nativeImage.createFromPath(iconPath)
      tray.setImage(newIcon)
    } else {
      log.main.warn('No tray instance to update icon.')
    }
  } catch (error: Error | unknown) {
    const errMsg = `Failed to update tray icon: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    throw new Error(errMsg)
  }
}

/**
 * Update the tray tooltip text.
 * @param tooltip - New tooltip text
 * @returns {void}
 */
export function updateTrayTooltip(tooltip: string): void {
  try {
    const tray = getTray()
    if (tray) {
      log.main.info('Updating tray tooltip.')
      tray.setToolTip(tooltip)
    } else {
      log.main.warn('No tray instance to update tooltip.')
    }
  } catch (error: Error | unknown) {
    const errMsg = `Failed to update tray tooltip: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    throw new Error(errMsg)
  }
}

/**
 * Update the tray menu top label icon.
 * @param iconPath - Path to the new icon image
 * @returns {void}
 */
export function updateTrayMenuIcon(iconPath: string): void {
  try {
    const tray: Tray | null = getTray()
    const trayContextMenu: Menu | null = getTrayContextMenu()
    if (tray && trayContextMenu) {
      log.main.info('Updating tray menu icon.')
      if (trayContextMenu && trayContextMenu.items.length > 0) {
        const topItem = trayContextMenu.items[0]
        topItem.icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
        tray.setContextMenu(trayContextMenu)

        //? We still update global state here too. I need to do it a better way later.
        setTrayContextMenu(trayContextMenu)
      } else {
        log.main.warn('Tray context menu is empty, cannot update icon.')
      }
    } else {
      log.main.warn('No tray instance to update menu icon.')
    }
  } catch (error: Error | unknown) {
    const errMsg = `Failed to update tray menu icon: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    throw new Error(errMsg)
  }
}
