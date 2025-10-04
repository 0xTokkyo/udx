/* eslint-disable @typescript-eslint/no-explicit-any */
/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-05 01:00:56 by 0xTokkyo                                    */
/*   Updated: 2025-10-05 01:17:55 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { contextBridge, ipcRenderer } from 'electron'
import { CustomElectronAPI } from './types'

const udxAPI: CustomElectronAPI = {
  // Event listeners
  on: (channel: any, callback: any) => ipcRenderer.on(channel, callback),
  send: (channel: any, ...args: any[]) => ipcRenderer.send(channel, ...args),

  // External links
  openExternalLink: (url: any) => {
    ipcRenderer.send('open-external-link', url)
  },

  // Electron Store operations
  store: {
    get: (key: string) => ipcRenderer.invoke('electron-store-get', key),
    set: (property: string, value: any) =>
      ipcRenderer.invoke('electron-store-set', property, value),
    delete: (key: string) => ipcRenderer.invoke('electron-store-delete', key),
    clear: () => ipcRenderer.invoke('electron-store-clear')
  },

  // Auth token management
  auth: {
    setToken: (token: string) => ipcRenderer.invoke('set-auth-token', token),
    getToken: () => ipcRenderer.invoke('get-auth-token'),
    clearToken: () => ipcRenderer.invoke('clear-auth-token')
  },

  // App paths
  paths: {
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    getLocalModelsPath: () => ipcRenderer.invoke('get-local-models-folder-path')
  },

  // Models
  models: {
    checkExists: (model: string) => ipcRenderer.invoke('check-model-exists', model)
  },

  // File operations
  file: {
    read: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
    readSettings: () => ipcRenderer.invoke('read-settings')
  },

  // Logging
  log: {
    info: (message: string, ...args: any[]) =>
      ipcRenderer.invoke('write-log', 'info', message, ...args),
    warn: (message: string, ...args: any[]) =>
      ipcRenderer.invoke('write-log', 'warn', message, ...args),
    error: (message: string, ...args: any[]) =>
      ipcRenderer.invoke('write-log', 'error', message, ...args),
    debug: (message: string, ...args: any[]) =>
      ipcRenderer.invoke('write-log', 'debug', message, ...args)
  },

  // App control
  app: {
    restart: () => ipcRenderer.send('restart-main-process')
  }
}

if (process.contextIsolated) {
  try {
    console.log('UDX IPC :: contextIsolated :: exposing udxAPI to main world')
    contextBridge.exposeInMainWorld('udx', udxAPI)
  } catch (error: Error | unknown) {
    const errMsg = `UDX IPC :: contextBridge error: ${error}`
    console.error(errMsg)
  }
} else {
  // @ts-ignore (define in dts)
  window.udx = udxAPI
}
