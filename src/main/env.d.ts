/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_CLIENT_ID: string
  readonly VITE_COORDINATION_URL: URL
  readonly VITE_FALLBACK_SERVER_URL: URL
  readonly VITE_UDX_SERVER_URL_HTTPS: string
  readonly VITE_UDX_SERVER_URL_WSS: string
  readonly VITE_AUTH_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
