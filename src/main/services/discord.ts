/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   discord.ts                                           / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-05 00:09:53 by 0xTokkyo                                    */
/*   Updated: 2025-10-06 00:20:33 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import DiscordRPC from 'discord-rpc'
import { log } from '@main/core'

/**
 * @file src/main/services/discord.ts
 * @description Handles Discord Rich Presence (RPC) integration.
 * @alias main/services/discord
 */

DiscordRPC.register(import.meta.env.VITE_DISCORD_CLIENT_ID)

// CONSTANTS
const RPC = new DiscordRPC.Client({ transport: 'ipc' })

export async function setDiscordActivity(activity?: DiscordRPC.Presence): Promise<void> {
  try {
    log.info('Setting Discord activity...')

    if (!RPC) {
      log.warn('Discord RPC client is not initialized. Skipping activity update.')
      return
    }

    const defaultActivity: DiscordRPC.Presence = {
      details: 'UDX for Star Citizen',
      state: 'In App',
      largeImageKey: 'discord-icon-bottom',
      buttons: [{ label: 'GET UDX', url: 'https://udx.uxondynamics.com/download/' }]
    }

    if (!activity) activity = defaultActivity
    await RPC.login({ clientId: import.meta.env.VITE_DISCORD_CLIENT_ID })
    await RPC.setActivity(activity)
  } catch (error: Error | unknown) {
    const errMsg = `Failed to set Discord activity: ${error instanceof Error ? error.message : String(error)}`
    // Log a Warning and not a Error to avoid spamming the logs if Discord is just... not running.
    log.warn(errMsg)
  }
}
