/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 13:35:59 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 09:48:01 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

export interface UDXSettings {
  lang: string
  firstTimeJoinOrg: boolean
  firstTimeCreateOrg: boolean
}

export interface AppOptions {
  notifications: boolean
  soundFx: boolean
  streamerMode: boolean
  darkMode: boolean
}

export interface AppSettings {
  udxSettings: UDXSettings
  appOptions: AppOptions
}

export interface OptionItemProps {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

export interface LangOptionItemProps {
  label: string
  value: string
  onChange: () => void
  isSelected?: boolean
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

export type SupportedLang = 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko'
export type SupportedLangFull =
  | 'en-US'
  | 'fr-FR'
  | 'de-DE'
  | 'es-ES'
  | 'it-IT'
  | 'pt-BR'
  | 'ru-RU'
  | 'zh-CN'
  | 'ja-JP'
  | 'ko-KR'

export interface ModTranslations {
  [modId: string]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [lang in SupportedLang]?: Record<string, any>
  }
}
