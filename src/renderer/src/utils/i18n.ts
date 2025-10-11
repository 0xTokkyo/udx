/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   i18n.ts                                              / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-09 21:16:17 by 0xTokkyo                                    */
/*   Updated: 2025-10-10 21:23:00 by 0xTokkyo                                    */
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

const initializeI18n = async (): Promise<void> => {
  const namespaces = await discoverComponentNamespaces()

  await i18n
    .use(electronBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      debug: is.dev ? true : false,
      ns: namespaces,
      defaultNS: 'common',
      detection: {
        order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage']
      }
    })
}

// Initialize i18n asynchronously
initializeI18n().catch((error) => {
  console.error('Failed to initialize i18n:', error)
})

export default i18n
