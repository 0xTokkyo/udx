/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   frame-controller.tsx                                 / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-08 00:06:18 by 0xTokkyo                                    */
/*   Updated: 2025-10-10 10:32:57 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import React, { useCallback } from 'react'
import { Ellipsis, Maximize, Minus, X } from 'lucide-react'
import { useUI } from '@renderer/contexts/zustore'

/**
 * @file src/renderer/src/ui/frame-controller.tsx
 * @description A component that provides window controls and a menu toggle for the application frame.
 * @param mode - Mode of the frame controller (auth or main)
 */

type FrameControllerProps = {
  mode?: 'auth' | 'main'
}

const FrameController: React.FC<FrameControllerProps> = (props) => {
  const { isSettingsOpen, toggleSettings } = useUI()

  const handleMinimize = useCallback((): void => {
    window.udx.send('minimize-window')
  }, [])

  const handleMaximize = useCallback((): void => {
    window.udx.send('maximize-window')
  }, [])

  const handleClose = useCallback((): void => {
    window.udx.send('close-window')
  }, [])

  return (
    <div id="frame-controller" data-mode={props.mode ? props.mode : 'main'}>
      <div className="app-name text-s">UXON DYNAMICS</div>
      <div className="app-settings-trigger" data-cursor="pointer" onClick={toggleSettings}>
        {isSettingsOpen ? <Minus size={18} /> : <Ellipsis size={18} />}
      </div>
      <div className="app-loading-indicator"></div>
      <div className="special-message">
        <div className="text color-success text-s text-medium"></div>
      </div>
      <div className="app-window-controls">
        <span className="app-window-button minimize" onClick={handleMinimize} data-cursor="pointer">
          <Minus size={18} />
        </span>
        <span className="app-window-button maximize" onClick={handleMaximize} data-cursor="pointer">
          <Maximize size={16} strokeWidth={2.25} />
        </span>
        <span className="app-window-button close" onClick={handleClose} data-cursor="pointer">
          <X size={18} />
        </span>
      </div>
    </div>
  )
}
FrameController.displayName = 'Frame Controller'

export default FrameController
