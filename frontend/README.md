# Raison Platform

A React + TypeScript + Vite application with authentication and organization management.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/      # Reusable UI components
│   └── ui/          # shadcn/ui components
├── modules/         # Feature modules
│   ├── auth/        # Authentication (login, register, etc.)
│   ├── onboarding/  # User onboarding flow
│   └── organization/# Organization management
├── layouts/         # Layout components
├── providers/       # React context providers
├── stores/          # Zustand state management
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
│   ├── auth-client.ts   # Better Auth client
│   ├── query-client.ts  # React Query setup
│   └── request.ts       # Axios configuration
└── main.tsx         # Application entry point
```

## Module Structure

Each module follows a consistent pattern:

```
modules/[feature]/
├── components/      # Feature-specific components
├── routes/          # Route components for pages
├── hooks.ts         # Custom hooks (queries, mutations)
├── schema.ts        # Zod validation schemas
└── types.ts         # TypeScript types and interfaces
```

**Example: Auth Module**
- `components/` - Login, register, forgot password forms
- `routes/` - Page components for each auth flow
- `hooks.ts` - useLogin, useRegister, useVerifyEmail mutations
- `schema.ts` - Form validation schemas
- `types.ts` - Auth-related type definitions

## Auth Provider

The `AuthProvider` wraps the entire app and handles authentication flow:

1. **Session Check** - Fetches user session and organizations on mount
2. **Route Guards** - Automatically redirects based on auth state:
   - No user → `/auth/login`
   - User with no org → `/onboarding`
   - User with org but no active org → `/select-organization`
   - User with active org → Protected routes
3. **Context** - Provides `user` and `session` to all components via `useAuthContext()`

## Layouts

The application uses three main layouts:

### BrandedLayout (`/auth/*` and `/onboarding/*`)
A beautiful split-screen layout featuring:
- **Left Panel** (desktop only):
  - Dark gradient background with animated glowing orbs
  - Raison branding and tagline
  - Key product features showcase:
  - Copyright and legal links
- **Right Panel**:
  - Clean form presentation area
  - "Switch account" button (onboarding only) for logging out during setup
  - Responsive design - left panel hidden on mobile

### AppLayout (`/*` protected routes)
Main application layout with:
- Collapsible sidebar navigation
- Breadcrumb navigation
- Content area for app pages

## Routing Tree

```
/ (AuthProvider wrapper)
├── /auth/* (BrandedLayout)    # Public auth routes
│   ├── /login
│   ├── /register
│   ├── /forgot-password
│   ├── /reset-password
│   └── /verify-email
├── /onboarding/* (BrandedLayout)  # User onboarding flow
│   ├── /organization          # Create organization
│   └── /invite-members        # Invite team members
└── /* (AppLayout)             # Protected routes
    ├── /                      # Home
    ├── /settings
    └── /agents
```

Routes are nested under `AuthProvider` which handles all authentication logic and redirects before any page renders.

## Tech Stack

- **React 19** with TypeScript
- **Vite** (Rolldown) for build tooling
- **TanStack Query** for server state
- **Better Auth** for authentication
- **Zustand** for client state
- **React Router** for routing
- **shadcn/ui** + **Tailwind CSS** for UI
- **Biome** for linting
