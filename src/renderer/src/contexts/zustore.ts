/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   zustore.ts                                           / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-08 00:06:11 by 0xTokkyo                                    */
/*   Updated: 2025-10-09 20:55:25 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ContextMenuProps, ContextMenuType } from '@renderer/types'

/**
 * @file src/renderer/src/contexts/zustore.ts
 * @description Zustand store for managing global state in the renderer process.
 * @see {@link https://github.com/pmndrs/zustand}
 */

interface AppState {
  // State
  app: {
    isOnline: boolean
  }
  ui: {
    isAppLoading: boolean
    isSettingsOpen: boolean
    isModalOpen: boolean
    isWindowMaximized: boolean
  }
  contextMenu: {
    isOpen: boolean
    type: ContextMenuType | null
    props: ContextMenuProps | null
    position: { x: number; y: number } | null
  }

  // Actions App
  setAppIsOnline: (isOnline: boolean) => void

  // Actions UI
  toggleAppLoadingIndicator: () => void
  toggleSettings: () => void
  toggleModal: () => void
  toggleWindowMaximized: () => void

  // Actions Context Menu
  openContextMenu: (
    type: ContextMenuType,
    props: ContextMenuProps,
    position: { x: number; y: number }
  ) => void
  closeContextMenu: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      app: {
        isOnline: true
      },
      ui: {
        isAppLoading: false,
        isSettingsOpen: false,
        isModalOpen: false,
        isWindowMaximized: false
      },
      contextMenu: {
        isOpen: false,
        type: null,
        props: null,
        position: null
      },

      // Actions App
      setAppIsOnline(isOnline: boolean) {
        set((state) => ({
          app: { ...state.app, isOnline }
        }))
      },

      // Actions UI
      toggleAppLoadingIndicator() {
        set((state) => ({
          ui: { ...state.ui, isAppLoading: !state.ui.isAppLoading }
        }))
      },
      toggleSettings() {
        set((state) => ({
          ui: { ...state.ui, isSettingsOpen: !state.ui.isSettingsOpen }
        }))
      },
      toggleModal() {
        set((state) => ({
          ui: { ...state.ui, isModalOpen: !state.ui.isModalOpen }
        }))
      },
      toggleWindowMaximized() {
        set((state) => ({
          ui: { ...state.ui, isWindowMaximized: !state.ui.isWindowMaximized }
        }))
      },

      // Actions Context Menu
      openContextMenu(type, props, position) {
        set(() => ({
          contextMenu: {
            isOpen: true,
            type,
            props,
            position
          }
        }))
      },
      closeContextMenu() {
        set(() => ({
          contextMenu: {
            isOpen: false,
            type: null,
            props: null,
            position: null
          }
        }))
      }
    }),
    { name: 'UDX AppStore' }
  )
)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useAppState = () => {
  const isOnline = useAppStore((state) => state.app.isOnline)

  const setIsOnline = useAppStore((state) => state.setAppIsOnline)

  return {
    isOnline,
    setIsOnline
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useUI = () => {
  const isAppLoading = useAppStore((state) => state.ui.isAppLoading)
  const isSettingsOpen = useAppStore((state) => state.ui.isSettingsOpen)
  const isModalOpen = useAppStore((state) => state.ui.isModalOpen)
  const isWindowMaximized = useAppStore((state) => state.ui.isWindowMaximized)

  const toggleAppLoadingIndicator = useAppStore((state) => state.toggleAppLoadingIndicator)
  const toggleSettings = useAppStore((state) => state.toggleSettings)
  const toggleModal = useAppStore((state) => state.toggleModal)
  const toggleWindowMaximized = useAppStore((state) => state.toggleWindowMaximized)

  return {
    isAppLoading,
    isSettingsOpen,
    isModalOpen,
    isWindowMaximized,
    toggleAppLoadingIndicator,
    toggleSettings,
    toggleModal,
    toggleWindowMaximized
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useContextMenu = () => {
  const isOpen = useAppStore((state) => state.contextMenu.isOpen)
  const type = useAppStore((state) => state.contextMenu.type)
  const props = useAppStore((state) => state.contextMenu.props)
  const position = useAppStore((state) => state.contextMenu.position)

  const open = useAppStore((state) => state.openContextMenu)
  const close = useAppStore((state) => state.closeContextMenu)

  return {
    isOpen,
    type,
    props,
    position,
    open,
    close
  }
}
