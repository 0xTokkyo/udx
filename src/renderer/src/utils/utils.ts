/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   utils.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-09 18:45:21 by 0xTokkyo                                    */
/*   Updated: 2025-10-10 21:21:13 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { RoleKey, RoleName, ROLES } from '@renderer/types'

/**
 * @file src/renderer/src/utils/utils.ts
 * @description Utility functions for the renderer process
 */

export const is = {
  dev: import.meta.env.MODE === 'development',
  prod: import.meta.env.MODE === 'production'
}

export function getRoleName(key: RoleKey): RoleName {
  return ROLES[key]
}

export function getRoleKey(name: RoleName): RoleKey | undefined {
  return Object.keys(ROLES).find((key) => ROLES[key as RoleKey] === name) as RoleKey | undefined
}

export function isSupportedLanguage(lang: string): boolean {
  return ['de', 'en', 'es', 'fr', 'jp', 'ru'].includes(lang)
}
