/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   globalState.ts                                       / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 12:39:17 by 0xTokkyo                                    */
/*   Updated: 2025-10-09 18:50:46 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

/**
 * @file src/main/core/globalState.ts
 * @description Global state management for the application.
 */

// Global state variables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let store: any = null
let tray: Electron.Tray | null = null
let trayContextMenu: Electron.Menu | null = null
let appDataPath: string | null = null
let ipcHandlersRegistered = false
let isQuitting = false
const autoEraseAuthToken = false

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStore = (): any => store
export const getTray = (): Electron.Tray | null => tray
export const getTrayContextMenu = (): Electron.Menu | null => trayContextMenu
export const getAppDataPath = (): string | null => appDataPath
export const getIpcHandlersRegistered = (): boolean => ipcHandlersRegistered
export const getIsQuitting = (): boolean => isQuitting
export const getAutoEraseAuthToken = (): boolean => autoEraseAuthToken

/**
 * Set the global store object.
 * @param newStore - New store object
 * @returns {void}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setStore = (newStore: any): void => {
  store = newStore
}

/**
 * Set the application data path.
 * @param path - Application data path or null
 * @returns {void}
 */
export const setAppDataPath = (path: string | null): void => {
  appDataPath = path
}

/**
 * Set the IPC handlers registered state.
 * @param registered - Whether IPC handlers are registered
 * @returns {void}
 */
export const setIpcHandlersRegistered = (registered: boolean): void => {
  ipcHandlersRegistered = registered
}

/**
 * Set the application quitting state.
 * @param quitting - Whether the application is quitting
 * @returns {void}
 */
export const setIsQuitting = (quitting: boolean): void => {
  isQuitting = quitting
}

/**
 * Set the Electron Tray instance.
 * @param newTray - New Electron Tray instance
 * @returns {void}
 */
export const setTray = (newTray: Electron.Tray | null): void => {
  tray = newTray
}

/**
 * Set the tray context menu.
 * @param menu - New tray context menu
 * @returns {void}
 */
export const setTrayContextMenu = (menu: Electron.Menu | null): void => {
  trayContextMenu = menu
}

/**
 * Reset all global state variables to their initial values.
 * @returns {void}
 */
export const resetGlobalState = (): void => {
  store = null
  appDataPath = null
  ipcHandlersRegistered = false
  isQuitting = false
}
