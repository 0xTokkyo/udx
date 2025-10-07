# UDX - Star Citizen Companion App

A desktop application built with Electron, React, and TypeScript that serves as the ultimate companion app for Star Citizen players. UDX provides real-time data management, organizational tools, and seamless integration with the Star Citizen universe through secure communication with [UDX-SERVER](https://github.com/0xTokkyo/udx-server).

https://github.com/user-attachments/assets/efd5f489-5284-41e8-82e2-6c2e073634d5

## Overview

UDX is designed to enhance the Star Citizen experience by providing:

- CLI for development and project management
- Cross-platform desktop application (Windows, macOS, Linux)
- Real-time communication with UDX-SERVER via REST API and WebSocket
- Secure authentication and data synchronization
- Modern React-based UI with Three.js 3D integration
- Discord Rich Presence integration and OAuth2 authentication
- Encrypted environment configuration
- Auto-updater functionality

## Quick Setup

```bash
# clone the project
git clone https://github.com/0xTokkyo/udx.git

# navigate to the project directory
cd udx

# install dependencies and initialize
npm genesis
```

That's it! The app will launch in development mode with hot reloading enabled.

https://github.com/user-attachments/assets/5dc65379-310d-4878-b457-aea88870f6da

## Project Structure

```
udx/
├── build/                            # Build assets and configuration
│   ├── entitlements.mac.plist        # macOS app entitlements
│   ├── icon.icns                     # macOS app icon
│   ├── icon.ico                      # Windows app icon
│   └── icon.png                      # Linux app icon
├── dev/                              # Development utilities
│   ├── extensions/                   # VS Code extensions
│   ├── mods/                         # Development modifications
│   ├── mts/                          # TypeScript utility scripts
│   │   ├── cli.mts                   # Interactive CLI
│   │   ├── create-udx-component.mts  # Component generator
│   │   ├── sync-envx.mts             # Environment sync utility
│   │   └── u.mts                     # Common utilities
│   └── test/                         # Test utilities
├── env/                              # Environment configuration files
├── resources/                        # Application resources
│   ├── icon.png                      # Main app icon
│   └── icons/                        # Multi-size icon variants
├── src/
│   ├── main/                         # Electron main process
│   │   ├── core/                     # Core main process modules
│   │   ├── services/                 # Main process services
│   │   └── types/                    # Main process type definitions
│   ├── preload/                      # Electron preload scripts
│   └── renderer/                     # React renderer process
│       ├── public/                   # Static assets
│       └── src/                      # React application source
│           ├── apps/                 # Application modules
│           ├── assets/               # Stylesheets, fonts, images
│           ├── components/           # React components
│           ├── contexts/             # React contexts
│           ├── hooks/                # Custom React hooks
│           ├── types/                # Type definitions
│           ├── ui/                   # UI component library
│           └── utils/                # Utility functions
└── Configuration files               # Various config files
```

## Architecture

UDX follows a modern Electron architecture with clear separation of concerns:

### **Main Process (Node.js)**
- **Core Modules**: Application lifecycle, window management, system integration
- **Services**: API communication, Discord integration, protocol handlers
- **IPC Handlers**: Secure communication bridge with renderer process
- **Security**: Global shortcuts, tray management, auto-updater

### **Preload Scripts**
- **Secure IPC Bridge**: Exposes safe APIs to renderer process
- **Context Isolation**: Prevents renderer from accessing Node.js APIs directly
- **Type Safety**: TypeScript definitions for all exposed APIs

### **Renderer Process (React)**
- **React 19**: Modern React with concurrent features
- **TypeScript**: Full type safety across the application
- **Three.js Integration**: 3D graphics and visualizations
- **State Management**: Zustand for lightweight state management
- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS with custom design system

### **Communication Flow**
```
UDX Desktop App ←→ UDX-SERVER ←→ Fleetyards APIs
     ↓                    ↓
 Local Storage      Database (SQLite)
     ↓                    ↓
 Electron Store     Real-time Sync
```

### **Security Model**
- **Process Isolation**: Strict separation between main and renderer processes
- **Context Isolation**: Renderer cannot access Node.js APIs directly
- **Secure IPC**: All communication through predefined, typed channels
- **Environment Encryption**: Production secrets encrypted with dotenvx
- **API Authentication**: Bearer tokens and secret headers for server communication

## Features

- **Cross-platform Desktop App** built with Electron
- **Modern React UI** with TypeScript support
- **Real-time Communication** with UDX-SERVER via REST API and WebSocket
- **3D Graphics Integration** using Three.js and React Three Fiber
- **Discord** for OAuth2 and social integration
- **Auto-updater** for seamless updates
- **System Tray Integration** for background operation
- **Global Shortcuts** for quick access
- **Secure Data Storage** with Electron Store
- **Multi-language Support** with i18next
- **Analytics Integration** with PostHog
- **Development CLI** for project management

## Environment Configuration

### Environment Files

The project uses multiple environment files located in the `env/` directory:

- `.env.local` - Development environment variables
- `.env` - Production environment variables (encrypted)

### Required Environment Variables

```bash
# Basic Configuration
VITE_DISCORD_CLIENT_ID='your-discord-client-id'
VITE_STORAGE_ENCRYPTION_KEY='your-encryption-key'
VITE_AUTH_TOKEN='your-auth-token'
VITE_UDX_SECRET='your-udx-secret'

# Server Configuration
VITE_UDX_SERVER_URL_HTTPS='https://your-server.com'
VITE_UDX_SERVER_URL_WSS='wss://your-server.com'

# Analytics (Optional)
VITE_ENABLE_ANALYTICS='false'
RENDERER_VITE_POSTHOG_HOST='https://eu.i.posthog.com'
RENDERER_VITE_POSTHOG_PUBLIC_KEY='your-posthog-key'
```

### The sync-envx Script

The `sync-envx` script manages environment file synchronization and encryption:

**What it does:**
- Synchronizes development and production environment files
- Encrypts sensitive configuration using dotenvx
- Ensures environment consistency across builds
- Validates required environment variables

**When it runs:**
- Automatically before `dev`, `build`, and `start` commands
- During the `postinstall` script
- Can be run manually with `npm run sync-envx`

## Available Scripts

### Development
```bash
npm run dev              # Start development with hot reloading
npm run start            # Start app in preview mode
npm run test             # Run test suite
```

### Building & Distribution
```bash
npm run build            # Build for current platform
npm run build:unpack    # Build unpacked (for testing)
npm run build:win       # Build for Windows
npm run build:mac       # Build for macOS
npm run build:linux     # Build for Linux
```

### Development Tools
```bash
npm run format          # Format code with Prettier
npm run lint            # Lint code with ESLint
npm run typecheck       # Run TypeScript type checking
npm run typecheck:node  # Type check main process only
npm run typecheck:web   # Type check renderer process only
```

### Utilities
```bash
npm run cli             # Run interactive CLI
npm run sync-envx       # Sync environment variables
npm run create:component # Create new React component
```

## CLI Tool

UDX includes an interactive CLI for development tasks:

```bash
npm run cli
```

The CLI provides:
- **Development**: Start dev server, preview mode
- **Building**: Multi-platform builds with options
- **Tools**: Code formatting, linting, type checking
- **Components**: Generate new React TSX components
- **Utilities**: Environment sync and project management

## Communication with UDX-SERVER

### REST API Integration
The app communicates with UDX-SERVER through a configured Axios client:

- **Authentication**: Bearer token and UDX secret headers
- **Base URL**: Configurable server endpoint
- **Interceptors**: Automatic logging and error handling
- **Type Safety**: TypeScript interfaces for all API responses

### WebSocket Connection
Real-time features are powered by Socket.IO:

- **User Rooms**: Personal real-time updates
- **Organization Rooms**: Team/guild communication
- **Event Streaming**: Live data synchronization
- **Reconnection**: Automatic reconnection with exponential backoff

### Security Features
- **Header Authentication**: `Authorization: Bearer <token>` and `X-UDX-Secret`
- **Health Checks**: Automatic server availability validation
- **Error Handling**: Graceful degradation when server is offline
- **Timeout Management**: Configurable request timeouts

## Building & Distribution

### Development Build
```bash
npm run dev
```
Starts the application in development mode with:
- Hot module reloading
- DevTools enabled
- Source maps
- Verbose logging

### Production Builds

**Universal Build:**
```bash
npm run build
```

**Platform-Specific Builds:**
```bash
npm run build:win    # Windows (exe, nsis)
npm run build:mac    # macOS (dmg, zip)
npm run build:linux  # Linux (AppImage, deb)
```

### Auto-Updater

The app includes electron-updater for automatic updates:
- **GitHub Releases**: Automatic update detection
- **Silent Updates**: Background downloading
- **User Consent**: Optional update prompts
- **Rollback Support**: Safe update mechanism

## Technology Stack

### Core Framework
- **Electron**: Cross-platform desktop framework
- **React 19**: Modern UI framework
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tool and dev server

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Three.js**: 3D graphics and visualizations
- **React Three Fiber**: React renderer for Three.js
- **Lucide React**: Icon library
- **GSAP**: Animation library

### State Management & Data
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management
- **React Router**: Client-side routing
- **Axios**: HTTP client

### Integration & Services
- **Discord RPC**: Rich Presence integration
- **Socket.IO**: Real-time communication
- **PostHog**: Analytics and feature flags
- **Electron Store**: Persistent local storage

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Electron Builder**: Application packaging
- **TSX**: TypeScript execution

## File Storage & Assets

### Public Assets
- Located in `src/renderer/public/`
- Accessible via HTTP in the renderer process
- Includes images, data files, and static resources

### Build Assets
- App icons for all platforms
- Electron builder configuration
- Platform-specific entitlements and certificates

### Dynamic Assets
- User-generated content
- Downloaded resources
- Cache and temporary files

## Development

### Getting Started
1. Ensure you have Node.js 18+ installed
2. Clone the repository and install dependencies
3. Configure environment variables in `env/.env.local`
4. Start the development server with `npm run dev`

### Creating Components
Use the built-in component generator:
```bash
npm run create:component
# or via CLI
npm run cli
```

This creates a new React TSX component with:
- TypeScript interface
- CSS module
- Proper imports and exports
- Component boilerplate

### Code Quality
The project enforces code quality through:
- **TypeScript**: Strict type checking
- **ESLint**: Code linting with React and Electron rules
- **Prettier**: Consistent code formatting
- **Pre-commit Hooks**: Automated quality checks

## Deployment

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build:win    # For Windows
npm run build:mac    # For macOS  
npm run build:linux  # For Linux
```

### Distribution
Built applications are output to the `dist/` directory:
- **Installers**: Ready-to-distribute installation files
- **Unpacked**: Development and testing builds
- **Updates**: Auto-updater compatible packages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Run tests and quality checks (`npm run lint && npm run typecheck`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful component names and props
- Use the provided utilities and hooks
- Maintain consistent styling with Tailwind CSS
- Test your changes across platforms when possible

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [UDX-SERVER](https://github.com/0xTokkyo/udx-server) - The backend server for UDX

## Support

For issues and questions:
- Open an issue on the [UDX repository](https://github.com/0xTokkyo/udx/issues)
- Check the Electron DevTools console for debugging
- Use the CLI tool for development utilities
- Review logs in the application data directory

## Acknowledgments

- Star Citizen community for inspiration and feedback
- Torlek Maru for very useful Fleetyards API
- Electron communities for excellent documentation
- Contributors who help improve the project
