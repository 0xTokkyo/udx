/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   index.ts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-08 00:06:42 by 0xTokkyo                                    */
/*   Updated: 2025-10-10 20:50:30 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

/**
 * @file src/renderer/src/types/index.ts
 * @description Global types for the renderer process
 */

// === USER ============================================
export interface User {}

// === ORGANIZATION ====================================
export interface Organization {
  id: string
  name: string
  slug: string
  description?: string | null
  tagline?: string | null
  website?: string | null
  members_count: number
  ship_count: number
  build_count: number
  event_count: number
  is_public: boolean
  is_fully_setup: boolean
  is_premium: boolean
  is_verified: boolean
  is_invitation_enabled: boolean
  has_banner: boolean
  has_logo: boolean
  banner_url?: string | null
  logo_url?: string | null
  activities: OrganizationActivity[]
}

export type OrganizationActivity =
  | 'BOUNTY_HUNTING'
  | 'CARGO_HAULING'
  | 'DATA_RUNNING'
  | 'DIPLOMACY'
  | 'ENGINEERING'
  | 'ESCORT'
  | 'EXPLORATION'
  | 'FARMING'
  | 'FREELANCING'
  | 'FUEL_REFUELING'
  | 'INDUSTRIAL'
  | 'INFILTRATION'
  | 'MEDICAL'
  | 'MERCENARY'
  | 'MILITARY'
  | 'MINING'
  | 'PATROL'
  | 'PIRACY'
  | 'POLITICS'
  | 'RACING'
  | 'REFINING'
  | 'REPAIR'
  | 'RESEARCH'
  | 'SALVAGING'
  | 'SCOUTING'
  | 'SEARCH_AND_RESCUE'
  | 'SECURITY'
  | 'SMUGGLING'
  | 'STEALTH_OPS'
  | 'TERRORISM'
  | 'TRADING'
  | 'TRANSPORT'
  | 'VERSATILE'

// === ROLES ===========================================
export const ROLES = {
  E2C6D4A7F8B3591C: 'Bounty Hunter',
  B364DE58DC52D9F3: 'Combat Pilot',
  D324EFD7FAE455BE: 'Combat Engineer',
  D9E3C5A781F0246B: 'Data Runner',
  E3B9A7D5C1F8246C: 'Diplomat',
  C9E727CFB1F342C5: 'Engineer',
  B1D3F9E74C8A2593: 'Explorer',
  D2867EEFF91498AB: 'Gunner',
  CX4BAEBB414C8FC1: 'Hauler',
  C8D4A1F3B7E9D526: 'Industrial',
  AD53B176DE67C5D7: 'Infantry',
  A5B7C3E9D8F1246A: 'Infiltration',
  D781DB3DA5DC7168: 'Medic',
  B3D9A7F1C4E8D526: 'Mercenary',
  D7A9B2E3C5F18D6C: 'Military',
  CB386DC846A9D76C: 'Pilot',
  C4A8E7D5B29F316D: 'Pirate',
  E8E129D2DEA21D5D: 'Salvage',
  E9F17C6B84A23F9B: 'Scout',
  F1C3A8B7D9E5F246: 'Security',
  A7D3C1E9F4258B6C: 'Smuggler',
  A5C7F3B1D2849C5E: 'Transport',
  DD843DAA19A2CA8D: 'Versatile'
} as const

export type RoleKey = keyof typeof ROLES
export type RoleName = (typeof ROLES)[RoleKey]

export interface Role {
  key: RoleKey
  name: RoleName
  description: string
  color: string
  background_color: string
  active: boolean
  permissions: string[]
  icon?: string
}

// === SHIP ============================================
export type ShipRoles = 'BATTLESHIP'

// === CONTEXT MENU ====================================
export type ContextMenuType =
  | 'image'
  | 'quote'
  | 'user'
  | 'organization'
  | 'event'
  | 'ship'
  | 'build'
  | '3Dmodel'
  | null

export interface CMPUser {
  id: string
  org_id?: string | null
  display_name: string
  discord_avatar: string | null
  role_key: RoleKey
}

export interface CMPOrganization {
  id: string
  name: string
  slug: string
  description?: string | null
  tagline?: string | null
  website?: string | null
  members_count: number
  ship_count: number
  is_public: boolean
  is_fully_setup: boolean
  is_premium: boolean
  is_verified: boolean
  has_banner: boolean
  has_logo: boolean
  banner_url?: string | null
  logo_url?: string | null
  is_roleplaying: boolean
  activities: OrganizationActivity[]
}

export interface CMPShip {
  id: string
  name: string
  slug: string
  role: ShipRoles
}

export type ContextMenuProps = CMPUser | CMPOrganization | CMPShip
