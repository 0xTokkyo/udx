import { CustomElectronAPI } from './types'

declare global {
  interface Window {
    udx: CustomElectronAPI
  }
}
