/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 02:46:27 by 0xTokkyo                                    */
/*   Updated: 2025-10-04 20:36:25 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import {
  loadEncryptedEnvx,
  log,
  initializeAppData,
  registerIpcHandlers,
  createTray
} from '@main/core'
import { initializeProtocols } from '@main/services/protocoles'

/**
 * @file src/main/index.ts
 * @description Main entry point for the application.
 * @alias main/index
 */

try {
  log.setContext('MAIN')

  /**
   * Load encrypted environment variables with dotenvx
   * @returns {Promise<void>}
   */
  await loadEncryptedEnvx()

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
   * Set up the system tray
   * @returns {Promise<void>}
   */
  await createTray()

  log.info('UDX is starting.')
} catch (error: Error | unknown) {
  log.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
