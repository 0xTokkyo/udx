/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   protocoles.ts                                        / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 13:38:38 by 0xTokkyo                                    */
/*   Updated: 2025-10-04 20:33:35 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { ProtocolState } from '@main/types'
import { platform, logger } from '@main/core'
import { app } from 'electron'
import path from 'path'

/**
 * @file src/main/services/protocoles.ts
 * @description Custom protocol handler for the application uxondynamics:// on all platforms.
 * @alias main/services/protocoles
 */

const PROTOCOL_SCHEME = 'uxondynamics'

const protocolState: ProtocolState = {
  isRegistered: false,
  scheme: PROTOCOL_SCHEME
}

/**
 * Register the custom protocol for development mode
 * @throws {Error} If protocol registration fails
 */
function registerDevelopmentProtocol(): void {
  try {
    if (process.argv.length >= 2) {
      const success = app.setAsDefaultProtocolClient(PROTOCOL_SCHEME, process.execPath, [
        path.resolve(process.argv[1])
      ])

      if (success) {
        logger.debug(`Development protocol ${PROTOCOL_SCHEME}:// registered successfully`)
        protocolState.isRegistered = true
      } else {
        throw new Error('Failed to register development protocol')
      }
    } else {
      throw new Error('Insufficient command line arguments for development protocol')
    }
  } catch (error) {
    const message = `Failed to register development protocol: ${error instanceof Error ? error.message : String(error)}`
    logger.error(message)
    throw new Error(message)
  }
}

/**
 * Register the custom protocol for production mode
 * @throws {Error} If protocol registration fails
 */
function registerProductionProtocol(): void {
  try {
    const success = app.setAsDefaultProtocolClient(PROTOCOL_SCHEME)

    if (success) {
      logger.debug(`Production protocol ${PROTOCOL_SCHEME}:// registered successfully`)
      protocolState.isRegistered = true
    } else {
      throw new Error('Failed to register production protocol')
    }
  } catch (error) {
    const message = `Failed to register production protocol: ${error instanceof Error ? error.message : String(error)}`
    logger.error(message)
    throw new Error(message)
  }
}

/**
 * Register protocol for macOS with will-finish-launching event
 * @throws {Error} If macOS protocol registration fails
 */
function registerMacOSProtocol(): void {
  try {
    app.on('will-finish-launching', () => {
      try {
        const success = app.setAsDefaultProtocolClient(PROTOCOL_SCHEME)

        if (success) {
          logger.debug(`macOS protocol ${PROTOCOL_SCHEME}:// registered on will-finish-launching`)
          protocolState.isRegistered = true
        } else {
          logger.warn('Failed to register macOS protocol on will-finish-launching')
        }
      } catch (error) {
        logger.error('Error during macOS protocol registration:', error)
      }
    })

    logger.debug('macOS protocol registration event listener added')
  } catch (error) {
    const message = `Failed to setup macOS protocol registration: ${error instanceof Error ? error.message : String(error)}`
    logger.error(message)
    throw new Error(message)
  }
}

/**
 * Initialize custom protocol handlers for the application
 * Registers the uxondynamics:// protocol for deep linking
 * @returns {Promise<void>}
 * @throws {Error} If protocol initialization fails
 */
export async function initializeProtocols(): Promise<void> {
  logger.info(`Initializing custom protocol: ${PROTOCOL_SCHEME}://`)

  try {
    // Reset state before registration
    protocolState.isRegistered = false

    // Register protocol based on app mode
    if (process.defaultApp) {
      logger.debug('Registering protocol for development mode')
      registerDevelopmentProtocol()
    } else {
      logger.debug('Registering protocol for production mode')
      registerProductionProtocol()
    }

    // Additional macOS-specific registration
    if (platform.isMacOS) {
      logger.debug('Setting up macOS-specific protocol registration')
      registerMacOSProtocol()
    }

    logger.info(`Custom protocol ${PROTOCOL_SCHEME}:// initialization completed`)
  } catch (error) {
    const message = `Protocol initialization failed: ${error instanceof Error ? error.message : String(error)}`
    logger.error(message)
    throw new Error(message)
  }
}

/**
 * Check if the protocol is registered
 * @returns {boolean} Protocol registration status
 */
export function isProtocolRegistered(): boolean {
  return protocolState.isRegistered
}

/**
 * Get the registered protocol scheme
 * @returns {string} Protocol scheme
 */
export function getProtocolScheme(): string {
  return protocolState.scheme
}

/**
 * Handle protocol URL when the application is launched via protocol
 * @param url - The protocol URL that was used to launch the app
 * @returns {Promise<void>}
 */
export async function handleProtocolUrl(url: string): Promise<void> {
  logger.info(`Handling protocol URL: ${url}`)

  try {
    if (!url.startsWith(`${PROTOCOL_SCHEME}://`)) {
      throw new Error(`Invalid protocol URL: ${url}`)
    }

    // Extract the path and query parameters from the URL
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const searchParams = urlObj.searchParams

    logger.debug(`Protocol path: ${path}`)
    logger.debug(`Protocol params:`, Object.fromEntries(searchParams))

    // TODO: Implement specific protocol handling logic based on path and parameters

    logger.info('Protocol URL handled successfully')
  } catch (error) {
    const message = `Failed to handle protocol URL: ${error instanceof Error ? error.message : String(error)}`
    logger.error(message)
    throw new Error(message)
  }
}
