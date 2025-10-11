/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   main.tsx                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-09 18:06:43 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 12:12:24 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ensureI18nInitialized } from '@/utils/i18n'
import App from '@/app'

import '@/assets/css/global.css'
import '@/assets/css/responsive.css'
import '@/assets/css/app.css'
import '@/assets/css/ui.css'

/**
 * @copilot
 * @copilot-instructions
 * This Electron Vite React TypeScript project follows specific conventions outlined
 * in llms.txt, contributing.md and architecture.md located in the root directory.
 * Please refer to it for helpers, component structure, and project configuration.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 0,
      refetchOnWindowFocus: false
    }
  }
})

const renderApp = async (): Promise<void> => {
  await ensureI18nInitialized()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  )
}

renderApp()
