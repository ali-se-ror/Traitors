# Overview

**Traitors Game** is a comprehensive full-stack social deduction game application inspired by "Traitors" game mechanics. The app enables players to create accounts with username/codeword authentication (no email required), join a shared game space, vote on who they suspect of being a traitor, communicate through public/private messaging, and view real-time suspicion metrics. The application features a React frontend with a dark medieval-themed UI design system and an Express backend with in-memory storage.

## Recent Changes (January 26, 2025)
- ✅ **Complete Communications Hub**: Replaced simple messaging with full-featured "Whispers in the Dark" section on dashboard featuring tabbed interface (Public Board, Private Messages, Announcements) with live updates
- ✅ **Game Master Dashboard**: Comprehensive admin interface with voting analytics, message monitoring, and announcement broadcasting  
- ✅ **Enhanced Branding**: Changed app name to "Traitors Game" with skull logo throughout
- ✅ **Spooky Logout Page**: Atmospheric farewell page with return to login functionality
- ✅ **Fixed Voting Dropdown**: Resolved dropdown glitch with proper value binding and TypeScript definitions
- ✅ **Enhanced Logout Flow**: Fixed logout button to properly redirect to spooky logout page instead of direct link
- ✅ **Integrated Communications**: Private messaging with player selection, public board with spooky emojis, and announcement viewing all accessible from main dashboard

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Animation**: Framer Motion for UI animations

## Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with RESTful API design
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Express session middleware with bcrypt for password hashing
- **Session Storage**: In-memory session store with MemoryStore
- **API Structure**: Organized route handlers with centralized error handling

## Database Design
- **Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**:
  - `users`: Stores user accounts with username, hashed codeword, and timestamps
  - `votes`: Tracks voting relationships between users with foreign key constraints
- **Data Integrity**: UUID primary keys, foreign key constraints with cascading deletes

## Authentication & Security
- **Authentication Method**: Username + codeword (no email verification)
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: HTTP-only cookies with 7-day expiration
- **Authorization**: Route-level middleware for protected endpoints
- **CSRF Protection**: Built-in Express session security features

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript
- **Build Tools**: Vite, esbuild for production builds
- **Database**: @neondatabase/serverless, drizzle-orm, drizzle-kit
- **Backend**: Express.js, bcrypt, express-session, memorystore

### UI & Styling Dependencies
- **Design System**: @radix-ui/* components (20+ UI primitives)
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Utilities**: class-variance-authority, clsx, tailwind-merge
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Inter, Cinzel, JetBrains Mono)

### State & Data Management
- **API Client**: TanStack React Query for server state
- **Form Handling**: React Hook Form with @hookform/resolvers
- **Validation**: Zod with drizzle-zod integration
- **Date Handling**: date-fns

### Development & Runtime
- **Development**: tsx for TypeScript execution
- **Animation**: Framer Motion
- **Session Storage**: connect-pg-simple (configured but using memory store)
- **Utilities**: nanoid for ID generation

### Replit Integration
- **Development Tools**: @replit/vite-plugin-runtime-error-modal, @replit/vite-plugin-cartographer
- **Error Handling**: Runtime error overlay for development environment