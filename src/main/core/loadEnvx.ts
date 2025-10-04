/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   loadEnvx.ts                                          / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 11:19:20 by 0xTokkyo                                    */
/*   Updated: 2025-10-04 20:35:49 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import log from './logger'
import path from 'path'

/**
 * @file src/main/core/loadEnvx.ts
 * @description Utility to load encrypted environment variables using dotenvx.
 * @alias main/loadEnvx
 */
export async function loadEncryptedEnvx(): Promise<void> {
  try {
    log.info('Starting loadEncryptedEnvx()')
    const envPath = path.join(__dirname, '../../env/.env.production')

    const dotenvx = await import('@dotenvx/dotenvx')
    log.info('dotenvx imported successfully')

    dotenvx.config({
      path: envPath
    })

    log.info('Environment variables loaded successfully from .env.production')
  } catch (error: Error | unknown) {
    throw new Error(
      `Failed to load encrypted environment variables: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
