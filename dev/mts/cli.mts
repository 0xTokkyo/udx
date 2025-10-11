#!/usr/bin/env node
/* ***************************************************************************** */
/*                                                          __  __ ____  _  __   */
/*                                                         / / / // __ \| |/ /   */
/*   cli.mts                                              / / / // / / /|   /    */
/*                                                       / /_/ // /_/ //   |     */
/*   By: 0xTokkyo                                        \____//_____//_/|_|     */
/*                                                                               */
/*   Created: 2025-10-07 15:48:08 by 0xTokkyo                                    */
/*   Updated: 2025-10-11 11:44:06 by 0xTokkyo                                    */
/*                                                                               */
/* ***************************************************************************** */

import inquirer from 'inquirer'
import { spawn } from 'child_process'
import { colors } from './u.mts'

/**
 * @file dev/mts/cli.mts
 * @fileoverview CLI for UDX.
 */

interface MenuChoice {
  name: string
  value: string
  description: string
}

const CURSOR = `${colors.udx}${colors.bright}➤${colors.reset}`

function formatActionName(action: string, description: string, maxLength: number = 12): string {
  const actionPart = `${colors.udx}${colors.bright}${action}${colors.reset}`
  const padding = ' '.repeat(Math.max(0, maxLength - action.length))
  return `${actionPart}${padding} - ${description}`
}

function clearConsole(): void {
  process.stdout.write('\x1b[2J\x1b[0f')
}

const actions: MenuChoice[] = [
  {
    name: formatActionName('SYNC-ENVX', 'Sync environment variables for DotenvX'),
    value: 'sync-envx',
    description: `\n${colors.muted}Sync the environment variables for DotenvX${colors.reset}\n`
  },
  {
    name: formatActionName('DEV', 'Start app in development mode'),
    value: 'dev',
    description: `\n${colors.muted}Start the Electron app with hot reloading and development features${colors.reset}\n`
  },
  {
    name: formatActionName('START', 'Start app in preview mode'),
    value: 'start',
    description: `\n${colors.muted}Start the compiled app in preview mode${colors.reset}\n`
  },
  {
    name: formatActionName('TEST', 'Run tests'),
    value: 'test',
    description: `\n${colors.muted}Run the test suite${colors.reset}\n`
  },
  {
    name: formatActionName(
      'BUILD',
      `Build management ${colors.udx}${colors.bright}→${colors.reset}`
    ),
    value: 'build',
    description: `\n${colors.muted}Build the app for different platforms${colors.reset}\n`
  },
  {
    name: formatActionName(
      'TOOLS',
      `Development tools ${colors.udx}${colors.bright}→${colors.reset}`
    ),
    value: 'tools',
    description: `\n${colors.muted}Code formatting, linting, and development utilities${colors.reset}\n`
  },
  {
    name: formatActionName('CREATE:COMP', 'Create new React component'),
    value: 'create:component',
    description: `\n${colors.muted}Generate a new UDX React TSX component${colors.reset}\n`
  },
  {
    name: formatActionName('CREATE:APP', 'Create new React app'),
    value: 'create:app',
    description: `\n${colors.muted}Generate a new UDX React TSX app${colors.reset}\n`
  },
  {
    name: `${colors.muted}QUIT${colors.reset}\n`,
    value: 'exit',
    description: `\n${colors.muted}Close the CLI${colors.reset}\n`
  }
]

const buildActions: MenuChoice[] = [
  {
    name: formatActionName('BUILD', 'Build for current platform'),
    value: 'build',
    description: `\n${colors.muted}Build the app for production${colors.reset}\n`
  },
  {
    name: formatActionName('BUILD:UNPACK', 'Build unpacked version'),
    value: 'build:unpack',
    description: `\n${colors.muted}Build the app without packaging (for testing)${colors.reset}\n`
  },
  {
    name: formatActionName('BUILD:WIN', 'Build for Windows'),
    value: 'build:win',
    description: `\n${colors.muted}Build the app for Windows platform${colors.reset}\n`
  },
  {
    name: formatActionName('BUILD:MAC', 'Build for macOS'),
    value: 'build:mac',
    description: `\n${colors.muted}Build the app for macOS platform${colors.reset}\n`
  },
  {
    name: formatActionName('BUILD:LINUX', 'Build for Linux'),
    value: 'build:linux',
    description: `\n${colors.muted}Build the app for Linux platform${colors.reset}\n`
  },
  {
    name: `${colors.udx}${colors.bright}←${colors.reset} BACK\n`,
    value: 'back',
    description: `${colors.muted}Return to the main menu${colors.reset}`
  }
]

const toolsActions: MenuChoice[] = [
  {
    name: formatActionName('FORMAT', 'Format code with Prettier'),
    value: 'format',
    description: `\n${colors.muted}Format all code files with Prettier${colors.reset}\n`
  },
  {
    name: formatActionName('LINT', 'Lint code with ESLint'),
    value: 'lint',
    description: `\n${colors.muted}Run ESLint to check code quality${colors.reset}\n`
  },
  {
    name: formatActionName('TYPECHECK', 'Run TypeScript type checking'),
    value: 'typecheck',
    description: `\n${colors.muted}Check TypeScript types for main and renderer processes${colors.reset}\n`
  },
  {
    name: formatActionName('TYPECHECK:NODE', 'TypeScript check for main process'),
    value: 'typecheck:node',
    description: `\n${colors.muted}Check TypeScript types for main process only${colors.reset}\n`
  },
  {
    name: formatActionName('TYPECHECK:WEB', 'TypeScript check for renderer'),
    value: 'typecheck:web',
    description: `\n${colors.muted}Check TypeScript types for renderer process only${colors.reset}\n`
  },
  {
    name: `${colors.udx}${colors.bright}←${colors.reset} BACK\n`,
    value: 'back',
    description: `${colors.muted}Return to the main menu${colors.reset}`
  }
]

const BACKGROUND_COMMANDS = ['dev', 'build:win', 'build:mac', 'build:linux']

function runNpmScript(script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const isBackground = BACKGROUND_COMMANDS.includes(script)

    console.log(`\nEXECUTING npm run ${script}${isBackground ? ' (background)' : ''}\n`)

    const child = spawn('npm', ['run', script], {
      stdio: isBackground ? 'ignore' : 'inherit',
      cwd: process.cwd(),
      detached: isBackground
    })

    if (isBackground) {
      console.log(`${colors.green}✓${colors.reset} ${script} started in background`)
      console.log(
        `${colors.muted}You can continue using the CLI while ${script} runs${colors.reset}\n`
      )

      child.unref()
      resolve()
    } else {
      child.on('close', (code) => {
        if (code === 0) {
          console.log(
            `\n${colors.green}✓${colors.reset} npm run ${script} completed successfully\n`
          )
          resolve()
        } else {
          console.log(
            `\n${colors.red}✗${colors.reset} npm run ${script} failed with code: ${code}\n`
          )
          reject(new Error(`Command failed with code ${code}`))
        }
      })

      child.on('error', (error) => {
        console.error(`\n${colors.red}✗${colors.reset} Error while executing: ${error.message}\n`)
        reject(error)
      })
    }
  })
}

async function showMainMenu(): Promise<void> {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `SELECT AN ACTION:`,
        choices: actions,
        pageSize: 12,
        theme: {
          prefix: '',
          icon: {
            cursor: CURSOR
          }
        }
      }
    ])

    await handleAction(answer.action)
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      clearConsole()
      console.log(
        `\n\nThank you for using the ${colors.udx}${colors.bright}UDX ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
      )
      process.exit(0)
    }
    console.error('Error:', error)
    process.exit(1)
  }
}

async function showBuildMenu(): Promise<void> {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: ``,
        choices: buildActions,
        pageSize: 12,
        theme: {
          prefix: '',
          icon: {
            cursor: CURSOR
          }
        }
      }
    ])

    if (answer.action === 'back') {
      clearConsole()
      await showMainMenu()
    } else {
      await runNpmScript(answer.action)
      await showContinuePrompt()
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      clearConsole()
      console.log(
        `\n\nThank you for using the ${colors.udx}${colors.bright}UDX ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
      )
      process.exit(0)
    }
    console.error('Error:', error)
    clearConsole()
    await showMainMenu()
  }
}

async function showToolsMenu(): Promise<void> {
  try {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: ``,
        choices: toolsActions,
        pageSize: 12,
        theme: {
          prefix: '',
          icon: {
            cursor: CURSOR
          }
        }
      }
    ])

    if (answer.action === 'back') {
      clearConsole()
      await showMainMenu()
    } else {
      await runNpmScript(answer.action)
      await showContinuePrompt()
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      clearConsole()
      console.log(
        `\n\nThank you for using the ${colors.udx}${colors.bright}UDX ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
      )
      process.exit(0)
    }
    console.error('Error:', error)
    clearConsole()
    await showMainMenu()
  }
}

async function showContinuePrompt(): Promise<void> {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: `${colors.udx}Do you want to perform ${colors.bright}another action${colors.reset}${colors.udx}?${colors.reset}`,
      default: true,
      theme: {
        prefix: ''
      }
    }
  ])

  if (answer.continue) {
    clearConsole()
    await showMainMenu()
  } else {
    clearConsole()
    console.log(
      `Thank you for using the ${colors.udx}${colors.bright}UDX ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
    )
    process.exit(0)
  }
}

async function createComponent(): Promise<void> {
  try {
    console.log(`\n${colors.udx}${colors.bright}CREATE NEW UDX REACT COMPONENT${colors.reset}\n`)

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'folderName',
        message: 'Folder name:',
        validate: (input: string) => input.trim() !== '' || 'Folder name is required',
        theme: { prefix: `${colors.udx}?${colors.reset}` }
      },
      {
        type: 'input',
        name: 'componentName',
        message: 'Component name:',
        validate: (input: string) => input.trim() !== '' || 'Component name is required',
        theme: { prefix: `${colors.udx}?${colors.reset}` }
      }
    ])

    await runTsxScript('create-udx-component.mts', [answers.folderName, answers.componentName])
  } catch (error) {
    console.error('Error creating component:', error)
  }
}

async function createApp(): Promise<void> {
  try {
    console.log(`\n${colors.udx}${colors.bright}CREATE NEW UDX REACT APP${colors.reset}\n`)

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'folderName',
        message: 'App folder name:',
        validate: (input: string) => input.trim() !== '' || 'App folder name is required',
        theme: { prefix: `${colors.udx}?${colors.reset}` }
      },
      {
        type: 'input',
        name: 'appName',
        message: 'App name:',
        validate: (input: string) => input.trim() !== '' || 'App name is required',
        theme: { prefix: `${colors.udx}?${colors.reset}` }
      }
    ])

    await runTsxScript('create-udx-app.mts', [answers.folderName, answers.appName])
  } catch (error) {
    console.error('Error creating app:', error)
  }
}

function runTsxScript(scriptName: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\nExecuting: npx tsx ./dev/mts/${scriptName} ${args.join(' ')}\n`)

    const child = spawn('npx', ['tsx', `./dev/mts/${scriptName}`, ...args], {
      stdio: 'inherit',
      cwd: process.cwd()
    })

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${colors.green}✓${colors.reset} ${scriptName} completed successfully\n`)
        resolve()
      } else {
        console.log(`\n${colors.red}✗${colors.reset} ${scriptName} failed with code: ${code}\n`)
        reject(new Error(`Script failed with code ${code}`))
      }
    })

    child.on('error', (error) => {
      console.error(`\n${colors.red}✗${colors.reset} Error while executing: ${error.message}\n`)
      reject(error)
    })
  })
}

async function handleAction(action: string): Promise<void> {
  switch (action) {
    case 'build':
      await showBuildMenu()
      break
    case 'tools':
      await showToolsMenu()
      break
    case 'create:component':
      await createComponent()
      await showContinuePrompt()
      break
    case 'create:app':
      await createApp()
      await showContinuePrompt()
      break
    case 'exit':
      clearConsole()
      console.log(
        `Thank you for using the ${colors.udx}${colors.bright}UDX ${colors.udxBg}${colors.bright} CLI ${colors.reset}`
      )
      process.exit(0)
      break
    default:
      try {
        await runNpmScript(action)
        await showContinuePrompt()
      } catch (error) {
        console.error('Error while executing the command: ', error)
        await showContinuePrompt()
      }
      break
  }
}

async function main(): Promise<void> {
  clearConsole()
  console.log('')
  console.log(
    `${colors.udx}${colors.bright}UDX ${colors.udxBg}${colors.bright} CLI ${colors.reset} ${colors.udx}Welcome to the UDX interactive CLI.${colors.reset}`
  )
  console.log(`${colors.muted}Use the arrow keys ↑↓ to navigate and Enter to select${colors.reset}`)
  console.log('')

  await showMainMenu()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { main }
