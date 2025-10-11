/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   i18n.ts                                              / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-09 21:16:17 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 12:19:35 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { BackendModule, ReadCallback } from 'i18next'
import { is } from '@/utils'

/**
 * @file src/renderer/src/utils/i18n.ts
 * @description Internationalization (i18n) setup for the renderer process using i18next.
 * This configuration includes a custom backend to load translation files from the filesystem via Electron.
 * It also automatically discovers component namespaces for modular translations.
 *
 * @see {@link https://www.i18next.com/}
 * @see {@link https://react.i18next.com/}
 * @see {@link https://github.com/i18next/i18next}
 */

const electronBackend: BackendModule = {
  type: 'backend',
  init: () => {},
  read: async (language: string, namespace: string, callback: ReadCallback) => {
    try {
      let filePath: string

      if (namespace === 'translation' || namespace === 'common') {
        filePath = `src/renderer/src/locales/${language}.common.json`
      } else {
        const componentPath = `src/renderer/src/components/${namespace}/locales/${language}.json`
        const appPath = `src/renderer/src/apps/${namespace}/locales/${language}.json`

        let content = await window.udx.file.read(componentPath)
        if (content !== null) {
          filePath = componentPath
        } else {
          content = await window.udx.file.read(appPath)
          if (content !== null) {
            filePath = appPath
          } else {
            await window.udx.log.warn(
              `Translation file not found for namespace ${namespace} in either components or apps`
            )
            callback(null, {})
            return
          }
        }

        const translations = JSON.parse(content)
        callback(null, translations[namespace] || {})
        return
      }

      const content = await window.udx.file.read(filePath)
      if (content === null) {
        await window.udx.log.warn(`Translation file not found: ${filePath}`)
        callback(null, {})
        return
      }

      const translations = JSON.parse(content)
      callback(null, translations)
    } catch (error) {
      await window.udx.log.error(
        `Error loading translation file for ${language}/${namespace}:`,
        error
      )
      callback(null, {})
    }
  },
  create: () => {},
  save: () => {}
}

/**
 * Get the saved language from application settings
 * Falls back to 'en' if no settings are found or if there's an error
 */
const getSavedLanguage = async (): Promise<string> => {
  try {
    const settings = await window.udx.file.readSettings()
    if (settings && settings.udxSettings && settings.udxSettings.lang) {
      await window.udx.log.info(`Using saved language: ${settings.udxSettings.lang}`)
      return settings.udxSettings.lang
    }
    await window.udx.log.info('No saved language found, using fallback: en')
    return 'en'
  } catch (error) {
    await window.udx.log.error('Failed to read saved language from settings:', error)
    return 'en'
  }
}

/**
 * Automatically discover component namespaces using glob pattern matching
 * This uses Vite's import.meta.glob to find all components and apps with locales
 */
const discoverComponentNamespaces = async (): Promise<string[]> => {
  const namespaces: string[] = ['common']

  try {
    const componentLocaleFiles = import.meta.glob(
      '/src/renderer/src/components/*/locales/en.json',
      {
        eager: false
      }
    )

    const appLocaleFiles = import.meta.glob('/src/renderer/src/apps/*/locales/en.json', {
      eager: false
    })

    const componentNames = Object.keys(componentLocaleFiles)
      .map((path) => {
        const match = path.match(/\/components\/([^/]+)\/locales\/en\.json$/)
        return match ? match[1] : null
      })
      .filter(Boolean) as string[]

    const appNames = Object.keys(appLocaleFiles)
      .map((path) => {
        const match = path.match(/\/apps\/([^/]+)\/locales\/en\.json$/)
        return match ? match[1] : null
      })
      .filter(Boolean) as string[]

    namespaces.push(...componentNames, ...appNames)

    console.debug('Discovered namespaces - Components:', componentNames, 'Apps:', appNames)
  } catch (error) {
    console.warn('Failed to discover namespaces:', error)
  }

  return namespaces
}

let isInitialized = false
let initializationPromise: Promise<void> | null = null

const initializeI18n = async (): Promise<void> => {
  if (isInitialized) {
    return
  }

  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    try {
      const namespaces = await discoverComponentNamespaces()
      const savedLanguage = await getSavedLanguage()

      await i18n
        .use(electronBackend)
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          lng: savedLanguage,
          fallbackLng: 'en',
          debug: is.dev ? true : false,
          ns: namespaces,
          defaultNS: 'common',
          detection: {
            order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage']
          }
        })

      isInitialized = true
      console.log('i18n initialized successfully')
    } catch (error) {
      console.error('Failed to initialize i18n:', error)
      // Initialize with minimal config as fallback
      await i18n.use(initReactI18next).init({
        lng: 'en',
        fallbackLng: 'en',
        debug: true,
        ns: ['common'],
        defaultNS: 'common',
        detection: {
          order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage']
        }
      })
      isInitialized = true
    }
  })()

  return initializationPromise
}

/**
 * Get current language for debugging purposes
 * @returns Current language code
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || 'en'
}

/**
 * Ensure i18n is initialized before using it
 * @returns Promise that resolves when i18n is ready
 */
export const ensureI18nInitialized = (): Promise<void> => {
  return initializeI18n()
}

/**
 * Check if i18n is initialized
 * @returns boolean indicating if i18n is ready
 */
export const isI18nInitialized = (): boolean => {
  return isInitialized && i18n.isInitialized
}

// Start initialization immediately
initializeI18n()

export default i18n
