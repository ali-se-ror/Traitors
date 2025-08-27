# Overview

**The Traitors** is a comprehensive full-stack social deduction game application inspired by "Traitors" game mechanics. The app enables players to create accounts with username/codeword authentication (no email required), join a shared game space, vote on who they suspect of being a traitor, communicate through public/private messaging, and view real-time suspicion metrics. The application features a React frontend with a dark medieval-themed UI design system and an Express backend with in-memory storage.

## Recent Changes (January 27, 2025)
- ✅ **80s Horror Dark Fantasy Aesthetic**: Complete transformation to Boris Vallejo/Frank Frazetta inspired styling with Blood Crimson, Electric Blue, Phantom Violet, and Demon Amber color palette
- ✅ **VHS Gritty Texture Effects**: Added repeating scanline patterns and film grain for authentic 80s horror movie atmosphere
- ✅ **Gothic Typography**: Implemented Nosifer and Creepster fonts with Hellraiser-style multi-colored glow effects (crimson/blue/violet shadows)
- ✅ **Heavy Metal Magazine Styling**: Copper rust borders, aged bone text, and metallic amber accents against deep shadow blacks
- ✅ **Cinematic Horror Lighting**: Atmospheric backgrounds with subtle red/blue/violet radial gradients inspired by The Gate, Legend, Evil Dead II
- ✅ **Profile Image System**: Fixed and integrated 9 retro Halloween profile avatars (RETRO-HALLOWEEN-38 through RETRO-HALLOWEEN-64) with deterministic assignment based on username
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