/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   appData.ts                                           / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-04 12:51:33 by 0xTokkyo                                    */
/*   Updated: 2025-10-04 21:18:54 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { app } from 'electron'
import {
  getAppDataPath,
  platform,
  setAppDataPath,
  logger,
  ensureDir,
  pathExists,
  writeJson,
  readJson
} from '@main/core'
import { AppSettings, UserMods } from '@main/types'
import path from 'path'

/**
 * @file src/main/core/appData.ts
 * @description Application data management and initialization.
 * @alias main/appData
 */

// Constants
const APP_DIR_NAME = '.uxon-dynamics'
const SETTINGS_FILE_NAME = 'uxon-dynamics-options.json'
const MODS_FILE_NAME = 'uxon-dynamics-mods.json'
const MODS_DIR_NAME = 'mods'
const MODELS_DIR_NAME = 'models'

/**
 * Get the appropriate app data directory based on platform
 * @returns {string} App data directory path
 */
function determineAppDataPath(): string {
  if (platform.isMacOS || platform.isLinux) {
    return app.getPath('home')
  }
  return app.getPath('appData')
}

/**
 * Create default application settings
 * @returns {AppSettings} Default settings object
 */
function createDefaultSettings(): AppSettings {
  return {
    udx: {
      lang: 'en',
      firstTimeJoinOrg: true,
      firstTimeCreateOrg: true
    },
    appOption: {
      notification: true,
      soundFx: true,
      streamerMode: true,
      darkMode: true
    }
  }
}

/**
 * Create default user mods configuration
 * @returns {UserMods} Default mods object
 */
function createDefaultMods(): UserMods {
  return { mods: [] }
}

/**
 * Ensure directory exists, create if not
 * @param dirPath - Directory path to ensure
 * @throws {Error} If directory creation fails
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await ensureDir(dirPath)
    logger.debug(`Directory ensured: ${dirPath}`)
  } catch (error: Error | unknown) {
    const message = `Failed to create directory: ${dirPath}`
    logger.error(message, error)
    throw new Error(message)
  }
}

/**
 * Create settings file if it doesn't exist
 * @param filePath - Settings file path
 * @throws {Error} If file creation fails
 */
async function createSettingsFileIfNotExists(filePath: string): Promise<void> {
  try {
    const exists = await pathExists(filePath)
    if (!exists) {
      const defaultSettings = createDefaultSettings()
      await writeJson(filePath, defaultSettings, { spaces: 2 })
      logger.info(`Created default settings file: ${filePath}`)
    } else {
      logger.debug(`Settings file already exists: ${filePath}`)
    }
  } catch (error: Error | unknown) {
    const message = `Failed to create settings file: ${filePath}`
    logger.error(message, error)
    throw new Error(message)
  }
}

/**
 * Create mods file if it doesn't exist
 * @param filePath - Mods file path
 * @throws {Error} If file creation fails
 */
async function createModsFileIfNotExists(filePath: string): Promise<void> {
  try {
    const exists = await pathExists(filePath)
    if (!exists) {
      const defaultMods = createDefaultMods()
      await writeJson(filePath, defaultMods, { spaces: 2 })
      logger.info(`Created default mods file: ${filePath}`)
    } else {
      logger.debug(`Mods file already exists: ${filePath}`)
    }
  } catch (error: Error | unknown) {
    const message = `Failed to create mods file: ${filePath}`
    logger.error(message, error)
    throw new Error(message)
  }
}

/**
 * Initialize application data directories and files
 * @returns {Promise<void>}
 * @throws {Error} If initialization fails
 */
export async function initializeAppData(): Promise<void> {
  logger.main.info('Initializing application data...')

  try {
    // Set app data path
    const basePath = determineAppDataPath()
    setAppDataPath(basePath)

    const appDataPath = getAppDataPath()
    if (!appDataPath) {
      throw new Error('Failed to set app data path')
    }

    logger.debug(`Using app data path: ${appDataPath}`)

    // Create main app directory
    const appDir = path.join(appDataPath, APP_DIR_NAME)
    await ensureDirectory(appDir)

    // Create settings file
    const settingsFilePath = path.join(appDir, SETTINGS_FILE_NAME)
    await createSettingsFileIfNotExists(settingsFilePath)

    // Create mods directory and file
    const modsDir = path.join(appDir, MODS_DIR_NAME)
    await ensureDirectory(modsDir)

    const modsFilePath = path.join(modsDir, MODS_FILE_NAME)
    await createModsFileIfNotExists(modsFilePath)

    // Create models directory
    const modelsDir = path.join(appDir, MODELS_DIR_NAME)
    await ensureDirectory(modelsDir)

    logger.main.info('Application data initialization completed successfully')
  } catch (error: Error | unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    logger.main.error('Failed to initialize application data:', message)
    throw new Error(`App data initialization failed: ${message}`)
  }
}

/**
 * Get the settings file path
 * @returns {string | null} Settings file path or null if app data path not set
 */
export function getSettingsFilePath(): string | null {
  const appDataPath = getAppDataPath()
  if (!appDataPath) return null
  return path.join(appDataPath, APP_DIR_NAME, SETTINGS_FILE_NAME)
}

/**
 * Get the mods file path
 * @returns {string | null} Mods file path or null if app data path not set
 */
export function getModsFilePath(): string | null {
  const appDataPath = getAppDataPath()
  if (!appDataPath) return null
  return path.join(appDataPath, APP_DIR_NAME, MODS_DIR_NAME, MODS_FILE_NAME)
}

/**
 * Get the models directory path
 * @returns {string | null} Models directory path or null if app data path not set
 */
export function getModelsDirPath(): string | null {
  const appDataPath = getAppDataPath()
  if (!appDataPath) return null
  return path.join(appDataPath, APP_DIR_NAME, MODELS_DIR_NAME)
}

/**
 * Load application settings
 * @returns {Promise<AppSettings>} Application settings
 * @throws {Error} If loading fails
 */
export async function loadAppSettings(): Promise<AppSettings> {
  const settingsPath = getSettingsFilePath()
  if (!settingsPath) {
    throw new Error('Settings file path not available')
  }

  try {
    const settings = (await readJson(settingsPath)) as AppSettings
    logger.debug('Settings loaded successfully')
    return settings
  } catch (error: Error | unknown) {
    logger.error('Failed to load settings:', error)
    throw new Error('Failed to load application settings')
  }
}

/**
 * Save application settings
 * @param settings - Settings to save
 * @returns {Promise<void>}
 * @throws {Error} If saving fails
 */
export async function saveAppSettings(settings: AppSettings): Promise<void> {
  const settingsPath = getSettingsFilePath()
  if (!settingsPath) {
    throw new Error('Settings file path not available')
  }

  try {
    await writeJson(settingsPath, settings, { spaces: 2 })
    logger.debug('Settings saved successfully')
  } catch (error: Error | unknown) {
    logger.error('Failed to save settings:', error)
    throw new Error('Failed to save application settings')
  }
}

/**
 * Read settings in the settings file
 * @returns {Promise<AppSettings>} Application settings
 * @throws {Error} If reading fails
 */
export async function readSettings(): Promise<AppSettings> {
  try {
    const settings = await loadAppSettings()
    return settings
  } catch (error: Error | unknown) {
    const message = `Failed to read settings: ${error instanceof Error ? error.message : String(error)}`
    logger.error(message)
    throw new Error(message)
  }
}

/**
 * Write settings in the settings file
 * @param settings - Settings to write
 * @returns {Promise<void>}
 * @throws {Error} If writing fails
 */
export async function writeSettings(settings: AppSettings): Promise<void> {
  try {
    await saveAppSettings(settings)
  } catch (error: Error | unknown) {
    const message = `Failed to write settings: ${error instanceof Error ? error.message : String(error)}`
    logger.error(message)
    throw new Error(message)
  }
}

/**
 * Read mods file
 * @returns {Promise<UserMods>} User mods
 * @throws {Error} If reading fails
 */
export async function readModsManager(): Promise<UserMods> {
  const modsPath = getModsFilePath()
  if (!modsPath) {
    throw new Error('Mods file path not available')
  }

  try {
    const mods = (await readJson(modsPath)) as UserMods
    logger.debug('Mods loaded successfully')
    return mods
  } catch (error: Error | unknown) {
    logger.error('Failed to load mods:', error)
    throw new Error('Failed to load user mods')
  }
}
