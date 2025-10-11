/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   windowManager.ts                                     / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 13:55:01 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 12:14:24 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { UDXPossibleWindows, UDXWindowMetadata, UDXWindowsPayload } from '@main/types'
import { is, log } from '@main/core'
import path from 'path'

/**
 * @file src/main/core/windowManager.ts
 * @description Window management utilities for the application.
 */

// CONSTANTS
const UDXWindows = new Map<string, UDXWindowMetadata>()

/**
 * Generate unique window ID.
 * @returns {string} Unique window identifier
 */
function generateWindowId(): string {
  return `udx-window-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Setup window event listeners to track state.
 * @param metadata - Window metadata object
 */
function setupWindowListeners(metadata: UDXWindowMetadata): void {
  const { window, id } = metadata

  // Track minimize state
  window.on('minimize', () => {
    metadata.isMinimized = true
    log.main.info(`Window ${id} minimized`)
  })

  window.on('restore', () => {
    metadata.isMinimized = false
    log.main.info(`Window ${id} restored`)
  })

  // Track maximize state
  window.on('maximize', () => {
    metadata.isMaximized = true
    log.main.info(`Window ${id} maximized`)
  })

  window.on('unmaximize', () => {
    metadata.isMaximized = false
    log.main.info(`Window ${id} unmaximized`)
  })

  // Track focus state
  window.on('focus', () => {
    metadata.isFocused = true
    log.main.info(`Window ${id} focused`)
  })

  // Clean up on close
  window.on('closed', () => {
    UDXWindows.delete(id)
    log.main.info(`Window ${id} closed and removed from registry`)
  })

  // Ready to show
  window.once('ready-to-show', () => {
    window.show()
    log.main.info(`Window ${id} ready and shown`)
  })
}

/**
 * Create application window.
 * @param payload - Window payload configuration
 * @param windowOptions - Optional BrowserWindow options
 * @returns {Promise<string>} Window ID
 * @throws {Error} If window creation fails
 * @example const windowId = await createWindow({ type: 'main', rendererHTMLFile: 'index' })
 */
export async function createWindow(
  payload: UDXWindowsPayload,
  windowOptions?: BrowserWindowConstructorOptions
): Promise<string> {
  try {
    const defaultWindowsOptions: BrowserWindowConstructorOptions = {
      width: 1080,
      minWidth: 1080,
      height: 800,
      minHeight: 800,
      transparent: true,
      skipTaskbar: true,
      thickFrame: false,
      roundedCorners: false,
      title: 'Uxon Dynamics',
      frame: false,
      show: false,
      webPreferences: {
        spellcheck: false,
        enableWebSQL: false,
        sandbox: false
      }
    }

    const finalOptions = windowOptions || defaultWindowsOptions

    const window = new BrowserWindow({
      ...finalOptions,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.mjs'),
        ...finalOptions.webPreferences
      }
    })

    // Generate unique ID for this window
    const windowId = generateWindowId()

    // Create metadata
    const metadata: UDXWindowMetadata = {
      id: windowId,
      type: payload.type || 'main',
      window,
      createdAt: new Date(),
      isMinimized: false,
      isMaximized: false,
      isFocused: false
    }

    // Setup event listeners
    setupWindowListeners(metadata)

    // HMR for renderer base on electron-vite cli.
    // Load the remote Payload URL in for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await window.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      const htmlFile = payload.rendererHTMLFile || 'index'
      await window.loadFile(path.join(__dirname, `../renderer/${htmlFile}.html`))
    }

    // Add to UDXWindows registry
    UDXWindows.set(windowId, metadata)
    log.main.info(`Window ${windowId} created and registered`)

    // Show window when ready
    window.once('ready-to-show', () => {
      window.show()
      return windowId
    })

    return windowId
  } catch (error: Error | unknown) {
    const errMsg = `Failed to create window: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    throw new Error(errMsg)
  }
}

/**
 * Reload targeted window.
 * @param target - Window ID or window type
 * @returns {Promise<void>}
 * @throws {Error} If window reload fails
 */
export async function reloadWindow(target: string | UDXPossibleWindows): Promise<void> {
  try {
    const metadata = getWindowMetadata(target)
    if (!metadata) {
      throw new Error(`Window ${target} not found`)
    }

    metadata.window.reload()
    log.main.info(`Window ${metadata.id} reloaded`)
  } catch (error: Error | unknown) {
    const errMsg = `Failed to reload ${target} window: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    throw new Error(errMsg)
  }
}

/**
 * Get window metadata by ID or type.
 * @param identifier - Window ID or window type
 * @returns {UDXWindowMetadata | undefined} Window metadata if found
 */
function getWindowMetadata(identifier: string | UDXPossibleWindows): UDXWindowMetadata | undefined {
  if (UDXWindows.has(identifier)) return UDXWindows.get(identifier)

  // If ID not found, search by type
  for (const metadata of UDXWindows.values()) {
    if (metadata.type === identifier) {
      return metadata
    }
  }

  return undefined
}

/**
 * Get window by ID or type.
 * @param identifier - Window ID or window type
 * @returns {BrowserWindow | undefined} BrowserWindow instance if found
 */
export function getWindow(identifier: string | UDXPossibleWindows): BrowserWindow | undefined {
  const metadata = getWindowMetadata(identifier)
  return metadata?.window
}

/**
 * Get all windows metadata.
 * @returns {UDXWindowMetadata[]} Array of all window metadata
 */
export function getAllWindows(): UDXWindowMetadata[] {
  return Array.from(UDXWindows.values())
}

/**
 * Get all windows of a specific type.
 * @param type - Window type to filter by
 * @returns {UDXWindowMetadata[]} Array of matching window metadata
 */
export function getWindowsByType(type: UDXPossibleWindows): UDXWindowMetadata[] {
  return Array.from(UDXWindows.values()).filter((metadata) => metadata.type === type)
}

/**
 * Close window by ID or type.
 * @param identifier - Window ID or window type
 * @returns {boolean} True if window was closed, false if not found
 */
export function closeWindow(identifier: string | UDXPossibleWindows): boolean {
  try {
    const metadata = getWindowMetadata(identifier)
    if (!metadata) {
      log.main.warn(`Window ${identifier} not found for closing`)
      return false
    }

    metadata.window.close()
    log.main.info(`Window ${metadata.id} closed`)
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to close window ${identifier}: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    return false
  }
}

/**
 * Close all windows of a specific type.
 * @param type - Window type to close
 * @returns {number} Number of windows closed
 */
export function closeWindowsByType(type: UDXPossibleWindows): number {
  const windows = getWindowsByType(type)
  let closed = 0

  for (const metadata of windows) {
    if (closeWindow(metadata.id)) {
      closed++
    }
  }

  return closed
}

/**
 * Close all windows.
 * @returns {number} Number of windows closed
 */
export function closeAllWindows(): number {
  const windowIds = Array.from(UDXWindows.keys())
  let closed = 0

  for (const id of windowIds) {
    if (closeWindow(id)) {
      closed++
    }
  }

  return closed
}

/**
 * Minimize window by ID or type.
 * @param identifier - Window ID or window type
 * @returns {boolean} True if window was minimized, false if not found
 */
export function minimizeWindow(identifier: string | UDXPossibleWindows): boolean {
  try {
    const metadata = getWindowMetadata(identifier)
    if (!metadata) {
      log.main.warn(`Window ${identifier} not found for minimizing`)
      return false
    }

    metadata.window.minimize()
    log.main.info(`Window ${metadata.id} minimized`)
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to minimize window ${identifier}: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    return false
  }
}

/**
 * Maximize window by ID or type.
 * @param identifier - Window ID or window type
 * @returns {boolean} True if window was maximized, false if not found
 */
export function maximizeWindow(identifier: string | UDXPossibleWindows): boolean {
  try {
    const metadata = getWindowMetadata(identifier)
    if (!metadata) {
      log.main.warn(`Window ${identifier} not found for maximizing`)
      return false
    }

    if (metadata.isMaximized) {
      metadata.window.unmaximize()
    } else {
      metadata.window.maximize()
    }
    log.main.info(`Window ${metadata.id} maximize toggled`)
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to maximize window ${identifier}: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    return false
  }
}

/**
 * Restore window from minimized or maximized state.
 * @param identifier - Window ID or window type
 * @returns {boolean} True if window was restored, false if not found
 */
export function restoreWindow(identifier: string | UDXPossibleWindows): boolean {
  try {
    const metadata = getWindowMetadata(identifier)
    if (!metadata) {
      log.main.warn(`Window ${identifier} not found for restoring`)
      return false
    }

    metadata.window.restore()
    log.main.info(`Window ${metadata.id} restored`)
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to restore window ${identifier}: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    return false
  }
}

/**
 * Focus window by ID or type.
 * @param identifier - Window ID or window type
 * @returns {boolean} True if window was focused, false if not found
 */
export function focusWindow(identifier: string | UDXPossibleWindows): boolean {
  try {
    const metadata = getWindowMetadata(identifier)
    if (!metadata) {
      log.main.warn(`Window ${identifier} not found for focusing`)
      return false
    }

    if (metadata.isMinimized) {
      metadata.window.restore()
    }
    metadata.window.focus()
    log.main.info(`Window ${metadata.id} focused`)
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to focus window ${identifier}: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    return false
  }
}

/**
 * Show window by ID or type.
 * @param identifier - Window ID or window type
 * @returns {boolean} True if window was shown, false if not found
 */
export function showWindow(identifier: string | UDXPossibleWindows): boolean {
  try {
    const metadata = getWindowMetadata(identifier)
    if (!metadata) {
      log.main.warn(`Window ${identifier} not found for showing`)
      return false
    }

    metadata.window.show()
    log.main.info(`Window ${metadata.id} shown`)
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to show window ${identifier}: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    return false
  }
}

/**
 * Show and put first plan all windows.
 * @returns {void}
 */
export function showAllWindows(): void {
  for (const metadata of UDXWindows.values()) {
    try {
      metadata.window.show()
      log.main.info(`Window ${metadata.id} shown`)
    } catch (error: Error | unknown) {
      const errMsg = `Failed to show window ${metadata.id}: ${error instanceof Error ? error.message : String(error)}`
      log.main.error(errMsg)
    }
  }
}

/**
 * Hide window by ID or type.
 * @param identifier - Window ID or window type
 * @returns {boolean} True if window was hidden, false if not found
 */
export function hideWindow(identifier: string | UDXPossibleWindows): boolean {
  try {
    const metadata = getWindowMetadata(identifier)
    if (!metadata) {
      log.main.warn(`Window ${identifier} not found for hiding`)
      return false
    }

    metadata.window.hide()
    log.main.info(`Window ${metadata.id} hidden`)
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to hide window ${identifier}: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    return false
  }
}

/**
 * Reload the content of the window by ID or type.
 * @param identifier - Window ID or window type
 * @returns {boolean} True if window content was reloaded, false if not found
 */
export function refreshWindowContent(identifier: string | UDXPossibleWindows): boolean {
  try {
    const metadata = getWindowMetadata(identifier)
    if (!metadata) {
      log.main.warn(`Window ${identifier} not found for content refresh`)
      return false
    }

    metadata.window.webContents.reload()
    log.main.info(`Window ${metadata.id} content reloaded`)
    return true
  } catch (error: Error | unknown) {
    const errMsg = `Failed to refresh content of window ${identifier}: ${error instanceof Error ? error.message : String(error)}`
    log.main.error(errMsg)
    return false
  }
}

/**
 * Check if window exists.
 * @param identifier - Window ID or window type
 * @returns {boolean} True if window exists
 */
export function hasWindow(identifier: string | UDXPossibleWindows): boolean {
  return getWindowMetadata(identifier) !== undefined
}

/**
 * Get window state.
 * @param identifier - Window ID or window type
 * @returns {Object | null} Window state object or null if not found
 */
export function getWindowState(identifier: string | UDXPossibleWindows): {
  id: string
  type: UDXPossibleWindows
  isMinimized: boolean
  isMaximized: boolean
  isFocused: boolean
  isVisible: boolean
  isDestroyed: boolean
  createdAt: Date
} | null {
  const metadata = getWindowMetadata(identifier)
  if (!metadata) {
    return null
  }

  return {
    id: metadata.id,
    type: metadata.type,
    isMinimized: metadata.isMinimized,
    isMaximized: metadata.isMaximized,
    isFocused: metadata.isFocused,
    isVisible: metadata.window.isVisible(),
    isDestroyed: metadata.window.isDestroyed(),
    createdAt: metadata.createdAt
  }
}
