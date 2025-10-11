/// <reference types="vite/client" />

import type { CustomElectronAPI } from '@preload/types'

declare global {
  interface Window {
    udx: CustomElectronAPI
  }
}

interface ImportMetaEnv {
  readonly VITE_DISCORD_CLIENT_ID: string
  readonly VITE_COORDINATION_URL: string
  readonly VITE_FALLBACK_SERVER_URL: string
  readonly RENDERER_VITE_POSTHOG_PUBLIC_KEY: string
  readonly RENDERER_VITE_POSTHOG_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
