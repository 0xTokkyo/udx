/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   loadEnvx.ts                                          / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 11:19:20 by 0xTokkyo                                    */
/*   Updated: 2025-10-09 18:50:05 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { is } from '.'
import log from './logger'
import path from 'path'

/**
 * @file src/main/core/loadEnvx.ts
 * @description Utility to load encrypted environment variables using dotenvx.
 */
export async function loadEncryptedEnvx(): Promise<void> {
  try {
    const ENV = is.dev ? '.env.local' : '.env.production'
    log.info('Loading encrypted environment variables: ' + ENV)
    const envPath = path.join(__dirname, '../../env', ENV)

    const dotenvx = await import('@dotenvx/dotenvx')
    log.info('dotenvx imported successfully')

    dotenvx.config({
      path: envPath
    })

    log.info('Environment variables loaded successfully from ' + ENV)
  } catch (error: Error | unknown) {
    throw new Error(
      `Failed to load encrypted environment variables: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
