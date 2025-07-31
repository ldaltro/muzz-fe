# 🧪 Muzz Frontend Engineering Test

Welcome to the Muzz Frontend Engineering Test! This is a chat application built with modern web technologies, simulating a real-world codebase. We've provided a starting point with both frontend and backend implementations to help you get started quickly.

Your task is to take ownership of this project, refactor and improve the code, fix issues, and implement new features — just like a lead engineer would when inheriting an existing app.

Most of your time will be spent working in the `frontend/src/pages/chat` directory, which contains the core chat functionality of the application. This includes the chat interface, message handling, and user interactions.

## 📋 Recent Architectural Improvements

### 🔌 WebSocket Chat Implementation
- **Real-time messaging** with Socket.IO for bidirectional communication
- **Optimistic UI updates** that reflect changes immediately while syncing with server
- **Automatic reconnection** handling with exponential backoff
- **Message grouping** by timestamp for improved readability
- **Scroll restoration** maintaining user position during message loading

### 🧪 Comprehensive Test Coverage
- **Unit tests** for all critical chat functionality
- **Integration tests** for WebSocket event handling
- **Mock implementations** for external dependencies (Socket.IO, API calls)
- **React Testing Library** for component interaction testing
- **Custom test utilities** for consistent test setup and teardown

### 🔄 React Query Integration
- **Server state management** with automatic caching and synchronization
- **Infinite scrolling** for message history with efficient pagination
- **Background refetching** keeping data fresh without user intervention
- **Optimistic updates** providing instant feedback during message operations
- **Error boundaries** with graceful fallbacks and retry mechanisms

### ⚙️ Environment Configuration
- **Environment-based API URLs** replacing hard-coded endpoints
- **CORS configuration** supporting multiple deployment environments
- **Development/production parity** ensuring consistent behavior across environments
- **Secure credential handling** for cross-origin requests

### 📊 Key Architectural Decisions

#### State Management Strategy
- **React Query for server state**: We use TanStack Query to efficiently manage messages, rooms, and user data. It's a powerful tool that simplifies handling server state.
- **Zustand for client state**: For things like UI preferences and connection status, Zustand is our go-to. It's lightweight and perfect for managing ephemeral data.
- **Trade-off**: While we've simplified global state management, React Query gives us robust server state handling.

#### Message Handling Architecture
- **Optimistic updates**: Our UI reflects changes instantly, even before the server confirms them. This keeps things snappy and responsive.
- **Conflict resolution**: By letting the server decide the final timestamp, we avoid message ordering issues.
- **Performance optimization**: We group messages efficiently and use React.memo to keep rendering fast.
- **Memory management**: Old messages are cleaned up automatically, with settings you can tweak to suit your needs.

#### Testing Philosophy
- **Behavior-driven tests**: We focus on how users interact with the app, not just the code itself.
- **Mock-first approach**: By isolating unit tests with controlled dependencies, we ensure reliability and consistency.
- **Integration boundaries**: Comprehensive WebSocket testing with real event flows
- **Visual regression**: Component snapshot testing for UI consistency

## 🔮 Suggested Next Steps & Improvements

### Security Hardening
- Implement rate limiting on message-send endpoints to prevent spam attacks.
- Add CSRF protection and secure headers using Helmet.
- Use JWT authentication with short-lived access tokens and a refresh token flow.

### Code Quality and Testing
- Integrate ESLint and Prettier to enforce code style and quality.
- Set up pre-commit hooks with Husky to ensure code quality before commits.
- Increase unit test coverage to over 90% to ensure reliability and stability.
- Add shared types between frontend and backend 

## 📋 Prerequisites

- Node.js (v18+ recommended)
- npm (v9+)

## 🚀 Getting Started

### Quick Start (Recommended)

1. **Clone the repository**
   ```bash
   git clone git@github.com:muzzapp/web-lead-tech-test.git
   cd web-lead-tech-test
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables (Required)**
   ```bash
   # Copy environment templates - this is required for the app to work
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   
   # Environment files are pre-configured for development
   # No editing needed for basic setup
   ```

4. **Start both servers simultaneously**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 3001) and frontend (port 5173) servers concurrently with colored output for easy monitoring.

### Environment Configuration Details

**Required Environment Setup:**

The application requires both frontend and backend environment variables to function. These are provided via `.env` files:

**Frontend Environment (.env.local):**
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)
- Pre-configured for development on port 5173

**Backend Environment (.env):**
- `PORT`: Server port (default: 3001)
- `ALLOWED_ORIGINS`: CORS origins for frontend (default: http://localhost:5173)
- `NODE_ENV`: Environment mode (development/production)

**Quick Setup Commands:**
```bash
# From project root - run these commands to set up required environment
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

**No additional configuration needed** - files are pre-configured for localhost development.

## 📜 Available Scripts

- `npm run dev` - Start both backend and frontend servers simultaneously
- `npm run dev:backend` - Start only the backend server
- `npm run dev:frontend` - Start only the frontend server  
- `npm run install:all` - Install dependencies for root, frontend, and backend
- `npm run build` - Build the frontend for production
- `npm run lint` - Run linting on the frontend code
- `npm run test` - Run tests for both backend and frontend (when available)

## 📁 Project Structure

```
.
├── frontend/                        # Frontend application
│   ├── src/
│   │   ├── assets/                 # Static assets like images and hardcoded api
│   │   ├── components/             # Reusable UI components
│   │   │   ├── button/
│   │   │   ├── container/    
│   │   │   ├── tabs/            
│   │   │   └── user-card/    
│   │   ├── pages/                  # Page components
│   │   │   ├── chat/              # Chat functionality
│   │   │   │   ├── _components/   # Chat-specific components
│   │   │   │   │   ├── chat-tab/  # Main chat interface
│   │   │   │   │   │   └── _components/
│   │   │   │   │   │       └── message/  # Message components
│   │   │   │   │   ├── header/    # Chat header
│   │   │   │   │   ├── profile-tab/ # User profile - Changes not needed
│   │   │   │   │   └── tabs/      # Chat navigation
│   │   │   │   └── Chat.tsx       # Main chat page
│   │   │   └── home/              # Home page with user selection
│   │   ├── store/                 # State management
│   │   │   ├── messages.store.ts  # Message state
│   │   │   ├── page.store.ts      # Page navigation state
│   │   │   └── user.store.ts      # User state
│   │   └── App.tsx                # Root component
│   └── package.json
│
└── backend/                        # Backend application
    ├── src/
    │   ├── controllers/           # Request handlers
    │   ├── models/               # Data models
    │   ├── routes/              # API routes
    │   └── server.ts            # Server entry point
    └── package.json
```

### Backend Starter

We've included a basic backend starter to save you time, but feel free to:
- Use your own backend implementation
- Modify the existing backend
- Use a different technology stack
- Implement any additional features

The current backend is a simple Express.js server with basic user and message endpoints. You can find it in the `backend` directory.

### Key Frontend Directories

- **`frontend/src/pages/chat`**: Contains the main chat functionality
  - `_components/chat-tab`: Handles message display and input
  - `_components/message`: Individual message components
  - `_components/header`: Chat header with navigation
  - `_components/profile-tab`: User profile information

- **`frontend/src/store`**: State management
  - `messages.store.ts`: Manages chat messages
  - `user.store.ts`: Handles user data and authentication
  - `page.store.ts`: Controls page navigation

- **`frontend/src/components`**: Reusable UI components
  - `button`: Custom button component
  - `container`: Page container
  - `tabs`: Navigation tabs
  - `user-card`: User display component
