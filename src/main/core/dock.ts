/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   dock.ts                                              / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 23:45:39 by 0xTokkyo                                    */
/*   Updated: 2025-10-09 18:50:41 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { ipcMain, Menu } from 'electron'
import { log } from '@main/core'

/**
 * @file src/main/core/dock.ts
 * @description Dock management for macOS.
 */

export async function createDockMenuTemplate(): Promise<Electron.Menu> {
  try {
    log.info('Creating dock menu template...')

    let modsSubMenu: Electron.MenuItemConstructorOptions[] = []
    let topMenuContent: Electron.MenuItemConstructorOptions[] = []

    // TODO: fetch real mods from app data / mods / manifest
    type UDXMod = {
      id: string
      name: string
    }

    const mods: UDXMod[] = []

    // TODO: Display real mods in dock menu
    if (mods && mods.length > 0) {
      modsSubMenu = mods.map((mod) => ({
        label: mod.name || 'mod',
        click: () => {
          ipcMain.emit('open-single-mod-in-renderer', mod.id)
        }
      }))
    }

    if (modsSubMenu.length === 0) {
      topMenuContent = [
        ...modsSubMenu,
        {
          type: 'separator'
        }
      ]
    }

    return Menu.buildFromTemplate([
      ...topMenuContent,
      {
        label: 'All Mods',
        enabled: modsSubMenu.length > 0,
        click: () => {
          ipcMain.emit('open-all-mods-in-renderer')
        }
      },
      {
        label: 'Create a Mod',
        click: () => {
          ipcMain.emit('create-mod-in-renderer')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'New Window',
        role: 'window',
        click: () => {
          ipcMain.emit('open-new-window')
        }
      },
      {
        label: 'Log Out',
        role: 'quit',
        click: () => {
          ipcMain.emit('clear-auth-token')
        }
      }
    ])
  } catch (error: Error | unknown) {
    const errMsg = `Failed to create dock menu template: ${error instanceof Error ? error.message : String(error)}`
    log.error(errMsg)
    throw new Error(errMsg)
  }
}
