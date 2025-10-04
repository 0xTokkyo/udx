/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   test.mts                                             / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-05 01:33:06 by 0xTokkyo                                    */
/*   Updated: 2025-10-05 01:53:17 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import { testIPC } from './validators/ipc-validator.mts'

// Run the IPC validation test
testIPC()
  .then((result) => {
    if (result.success) {
      console.info(result.message)
      process.exit(0)
    } else {
      console.error('IPC validation failed.')
      process.exit(1)
    }
  })
  .catch((err: unknown) => {
    console.error('Unexpected error during IPC validation:', err)
    process.exit(1)
  })
