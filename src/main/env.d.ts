/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_CLIENT_ID: string
  readonly VITE_COORDINATION_URL: URL
  readonly VITE_FALLBACK_SERVER_URL: URL
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
