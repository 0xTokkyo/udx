/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   app.tsx                                              / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-08 10:50:26 by 0xTokkyo                                    */
/*   Updated: 2025-10-10 10:40:01 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import React from 'react'
import FrameController from '@/ui/frame-controller'
import { AppSettings } from '@/components'

/**
 * @file src/renderer/src/app.tsx
 * @fileoverview Main Application Component
 * @description This is the main application component that serves as the entry point for the React application.
 */

function App(): React.JSX.Element {
  return (
    <>
      <FrameController mode="main" />
      <AppSettings />
    </>
  )
}
App.displayName = 'App'

export default App
