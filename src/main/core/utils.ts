/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   utils.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-09 09:46:46 by 0xTokkyo                                    */
/*   Updated: 2025-10-09 18:50:31 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { getStore } from '@main/core'

/**
 * @file src/main/core/utils.ts
 * @description Utility functions for the main process.
 */

export function userIsLoggedIn(): boolean {
  const store = getStore()
  if (store) {
    const token = store.get(import.meta.env.VITE_AUTH_TOKEN) as string | null | undefined
    return typeof token === 'string' && token.trim().length > 0
  }
  return false
}
