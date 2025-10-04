/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 12:46:37 by 0xTokkyo                                    */
/*   Updated: 2025-10-04 21:17:16 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { platform, is } from '@electron-toolkit/utils'
import fsExtra from 'fs-extra'

export * from './logger'
export * from './globalState'
export * from './loadEnvx'
export * from './appData'
export * from './windowManager'
export * from './ipcHandlers'
export * from './tray'
export * from './globalShortcuts'

export { platform, is }
export const { access, ensureDir, pathExists, writeJson, readJson, readFile } = fsExtra
