/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   serverCon.ts                                         / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 18:03:31 by 0xTokkyo                                    */
/*   Updated: 2025-10-07 20:10:36 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { log } from '@main/core'
import { api } from '.'

/**
 * @file src/main/services/serverCon.ts
 * @description Manage server connections and related functionalities.
 */

interface checkServerHealthResponse {
  success: boolean
  status: 'healty' | 'unhealty' | 'offline'
  message: string
}

export async function isUDXServerRunning(): Promise<boolean> {
  try {
    const response = await api.get<checkServerHealthResponse>('/api/health')

    if (!response.data.success) {
      log.warn(`UDX server health check failed with status: ${response.data.message}`)
      return false
    }
    log.info('UDX server is running and healthy.')
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to check UDX server status: ${error instanceof Error ? error.message : String(error)}`
    log.error(errMsg)
    throw new Error(errMsg)
  }
}

export async function isUDXDatabaseRunning(): Promise<boolean> {
  try {
    const response = await api.get<checkServerHealthResponse>('/api/database-health')

    if (!response.data.success) {
      log.warn(`UDX database health check failed with status: ${response.data.message}`)
      return false
    }
    log.info('UDX database is running and healthy.')
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to check UDX database status: ${error instanceof Error ? error.message : String(error)}`
    log.error(errMsg)
    throw new Error(errMsg)
  }
}

/**
 * Performs health checks for server and database connectivity
 * @description Validates that both UDX server and database are running and accessible
 * @throws {Error} If server or database checks fail
 * @returns {Promise<void>}
 */
export async function performHealthChecks(): Promise<void> {
  try {
    log.info('Performing system health checks...')

    const [serverIsAlive, dbIsAlive] = await Promise.all([
      isUDXServerRunning(),
      isUDXDatabaseRunning()
    ])

    const failures: string[] = []

    if (serverIsAlive) {
      log.info('SERVER CHECK PASSED')
    } else {
      log.error('SERVER CHECK FAILED')
      failures.push('Server is not running')
    }

    if (dbIsAlive) {
      log.info('DATABASE CHECK PASSED')
    } else {
      log.error('DATABASE CHECK FAILED')
      failures.push('Database is not accessible')
    }

    if (failures.length > 0) {
      const errorMessage = `Health checks failed: ${failures.join(', ')}`
      log.error(`${errorMessage} :: ABORTING APPLICATION STARTUP`)
      throw new Error(errorMessage)
    }

    log.info('All health checks passed :: CONTINUING')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log.error(`Health check error: ${errorMessage}`)
    log.error('SYSTEM CHECKS FAILED :: ABORTING')
    process.exit(1)
  }
}
