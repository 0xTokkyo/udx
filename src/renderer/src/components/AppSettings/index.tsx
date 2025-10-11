/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.tsx                                            / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-09 21:29:06 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 12:08:09 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useUI } from '@renderer/contexts/zustore'
import {
  AppSettings as AppSettingsType,
  AppOptions,
  LangOptionItemProps,
  OptionItemProps,
  SupportedLang
} from '@main/types'
import './index.css'

/**
 * @file src/renderer/src/components/AppSettings/index.tsx
 * @description A component that represents the UDX Application settings panel.
 */

const OptionItem: React.FC<OptionItemProps> = ({ label, value, onChange }) => {
  const { t: common } = useTranslation('common')

  return (
    <div className="option-row" data-option-value={value.toString()}>
      <div className="option-label">{label}</div>
      <div className="option-action">
        <span
          className="action"
          data-action-value="true"
          data-selected={value.toString()}
          onClick={() => onChange(true)}
        >
          {common('ui.yes')}
        </span>
        <span
          className="action"
          data-action-value="false"
          data-selected={(!value).toString()}
          onClick={() => onChange(false)}
        >
          {common('ui.no')}
        </span>
      </div>
    </div>
  )
}

const LangOptionItem: React.FC<LangOptionItemProps> = ({ label, onChange, isSelected }) => {
  return (
    <div className="lang-item" onClick={onChange} data-selected={isSelected ? 'true' : 'false'}>
      {label}
    </div>
  )
}

const AppSettings: React.FC = () => {
  const { t: common, i18n, ready } = useTranslation('common')
  const { t: trad } = useTranslation('AppSettings')

  const { isSettingsOpen, toggleAppLoadingIndicator } = useUI()
  const [settings, setSettings] = useState<AppSettingsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAnimations, setShowAnimations] = useState(false)

  const availableLangs: SupportedLang[] = [
    'en',
    'fr',
    'de',
    'es',
    'it',
    'pt',
    'ru',
    'zh',
    'ja',
    'ko'
  ]

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        setIsLoading(true)
        toggleAppLoadingIndicator()
        const appSettings = await window.udx.file.readSettings()
        if (appSettings?.appOptions) {
          setSettings(appSettings)
        }
      } catch (error: Error | unknown) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
        toggleAppLoadingIndicator()
      }
    }

    if (isSettingsOpen) {
      loadSettings()
    }
  }, [isSettingsOpen, toggleAppLoadingIndicator])

  useEffect(() => {
    if (isSettingsOpen && !isLoading && settings) {
      const timer = setTimeout(() => {
        setShowAnimations(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setShowAnimations(false)
      return undefined
    }
  }, [isSettingsOpen, isLoading, settings])

  const handleOptionChange = async (optionKey: keyof AppOptions, value: boolean): Promise<void> => {
    if (!settings) return

    const newSettings: AppOptions = { ...settings.appOptions, [optionKey]: value }
    setSettings({ ...settings, appOptions: newSettings })

    try {
      const fullSettings = await window.udx.file.readSettings()
      if (fullSettings) {
        const updatedFullSettings = {
          ...fullSettings,
          appOptions: newSettings
        }
        await window.udx.file.writeSettings(updatedFullSettings)
      }
    } catch (error: Error | unknown) {
      console.error('Failed to save settings:', error)
      setSettings(settings)
    }
  }

  const optionLabels: Record<keyof AppOptions, string> = {
    notifications: trad('notifications'),
    soundFx: trad('sound_fx'),
    streamerMode: trad('streamer_mode'),
    darkMode: trad('dark_mode')
  }

  const handleChangeLanguage = (lang: SupportedLang) => async (): Promise<void> => {
    if (!settings) return

    try {
      const updatedSettings: AppSettingsType = {
        ...settings,
        udxSettings: {
          ...settings.udxSettings,
          lang: lang
        }
      }

      setSettings(updatedSettings)

      await window.udx.file.writeSettings(updatedSettings)

      await i18n.changeLanguage(lang)

      console.log(`Language changed to: ${lang}`)
    } catch (error: Error | unknown) {
      console.error('Failed to change language:', error)
      setSettings(settings)
    }
  }

  // Protection : ne pas rendre si i18n n'est pas prêt
  if (!ready) {
    return (
      <div id="app-settings" className={isSettingsOpen ? 'display' : ''}>
        <div className="settings-section">
          <div>Loading translations...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div id="app-settings" className={isSettingsOpen && showAnimations ? 'display' : ''}>
        <div className="settings-section">
          <div className="options">
            <div className="title">{trad('title')}</div>
            <div className="list">
              {isLoading ? (
                <div>{common('ui.loading')}</div>
              ) : settings?.appOptions ? (
                Object.entries(settings.appOptions).map(([key, value]) => (
                  <OptionItem
                    key={key}
                    label={optionLabels[key as keyof AppOptions]}
                    value={value as boolean}
                    onChange={(newValue) => handleOptionChange(key as keyof AppOptions, newValue)}
                  />
                ))
              ) : (
                <div>{common('ui.failed_to_load')}</div>
              )}
            </div>
          </div>

          <div className="langs">
            <div className="title">{trad('language')}</div>
            <div className="list">
              {availableLangs.map((langCode) => (
                <LangOptionItem
                  key={langCode}
                  label={langCode.toUpperCase()}
                  value={langCode}
                  onChange={handleChangeLanguage(langCode)}
                  isSelected={settings?.udxSettings?.lang === langCode}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
AppSettings.displayName = 'App Settings'

export default AppSettings
