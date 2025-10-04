/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 13:35:59 by 0xTokkyo                                    */
/*   Updated: 2025-10-05 00:58:33 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

export interface UDXSettings {
  lang: string
  firstTimeJoinOrg: boolean
  firstTimeCreateOrg: boolean
}

export interface AppOptions {
  notification: boolean
  soundFx: boolean
  streamerMode: boolean
  darkMode: boolean
}

export interface AppSettings {
  udx: UDXSettings
  appOption: AppOptions
}

export interface UserMods {
  mods: Array<Record<string, unknown>>
}

export interface ProtocolState {
  isRegistered: boolean
  scheme: string
}

export type UDXPossibleWindows = 'main' | 'login'

export interface UDXWindowsPayload {
  type?: UDXPossibleWindows
  rendererHTMLFile?: string
}

export interface UDXWindowMetadata {
  id: string
  type: UDXPossibleWindows
  window: Electron.BrowserWindow
  createdAt: Date
  isMinimized: boolean
  isMaximized: boolean
  isFocused: boolean
}

export interface ModelInfo {
  filename: string
  format: string
  size: number
  url: string
  lastModified: string
}

export interface ModelsManifest {
  version: string
  models: {
    [key: string]: ModelInfo
  }
}
