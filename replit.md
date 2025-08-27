# Overview

**The Traitors** is a comprehensive full-stack social deduction game application inspired by "Traitors" game mechanics. The app enables players to create accounts with username/codeword authentication (no email required), join a shared game space, vote on who they suspect of being a traitor, communicate through public/private messaging, and view real-time suspicion metrics. The application features a React frontend with a dark medieval-themed UI design system and an Express backend with in-memory storage.

## Recent Changes (January 27, 2025)
- ✅ **Minimalist Retro Design**: Reverted to clean, tasteful retro styling with the original color palette - Pumpkin Orange, Witch Green, Midnight Black, Parchment Beige
- ✅ **Enhanced Purple/Green Focus**: Emphasized Acid Purple and Witch Green accents while keeping Pumpkin Orange for primary actions
- ✅ **Typography Balance**: Changed main titles and card headings to use regular fonts instead of retro fonts, keeping retro fonts only for special accents
- ✅ **Profile Image System**: Fixed PNG avatar system - users now get assigned real uploaded Halloween profile images instead of emoji symbols
- ✅ **Simplified Card Design**: Midnight black backgrounds with parchment borders that turn purple on hover
- ✅ **Tasteful Button Styling**: Primary buttons in Pumpkin Orange, secondary in Witch Green, special actions in Acid Purple with smooth transitions
- ✅ **Complete Communications Hub**: Full-featured "Whispers in the Dark" section with tabbed interface (Public Board, Private Messages, Announcements) and live updates
- ✅ **Game Master Dashboard**: Comprehensive admin interface with voting analytics, message monitoring, and announcement broadcasting  
- ✅ **Enhanced Branding**: Changed app name to "The Traitors" with custom skull logo throughout
- ✅ **Private Message Notifications**: Top-level notification system for received private messages with reply functionality
- ✅ **Spooky Player Symbols**: Automatic random symbol assignment (👻💀🦇🕷️etc.) for each player profile

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