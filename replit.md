# Overview

**The Traitors** is a comprehensive full-stack social deduction game application inspired by "Traitors" game mechanics. The app enables players to create accounts with username/codeword authentication (no email required), join a shared game space, vote on who they suspect of being a traitor, communicate through public/private messaging, and view real-time suspicion metrics. The application features a React frontend with a dark medieval-themed UI design system and an Express backend with in-memory storage.

## Recent Changes (August 29, 2025)
- ✅ **The Dark Deck Implementation**: Completely replaced all generated cards with custom user-provided deck featuring 39 authentic cards across three categories - Advantage Cards (✨), Disadvantage Cards (💀), and Chaotic/Funny Cards (🎭) with thematic descriptions and precise game effects
- ✅ **PostgreSQL Session Persistence**: Upgraded from memory-based to database-backed session storage ensuring zero data loss across server restarts for groups of 15+ players on multiple devices
- ✅ **Media Upload System**: Fully implemented video/image upload functionality for Game Master announcements with 50MB file limit, complete with presigned URLs and object storage integration
- ✅ **Enhanced Media Display**: Fixed media rendering in both dashboard announcements and Game Master interface showing proper images, videos, and attachment links
- ✅ **Production-Ready Database**: All user sessions, messages, announcements, and media persist permanently in PostgreSQL with connect-pg-simple integration

## Previous Changes (August 27, 2025)
- ✅ **Clean 80's Halloween Typography**: Implemented cohesive font system using Bebas Neue (capsule-shaped headers), Righteous (smooth retro script), Press Start 2P (VCR/tech), and Monoton (glow effects) for authentic retro feel without being over the top
- ✅ **Harmonious Neon Color System**: Researched and implemented synthwave-inspired color palette with Electric Purple (#8a2be2), Hot Magenta (#ff1493), and Neon Orange (#ff4500) - removed cyan for better color harmony
- ✅ **Consistent Gradient Typography**: All headings use matching purple-to-magenta gradients with proper letter-spacing for visual consistency
- ✅ **Profile Image System**: Fixed PNG avatar system - users now get assigned real uploaded Halloween profile images instead of emoji symbols
- ✅ **Unified Visual Language**: Standardized all neon effects and glow styles across the entire application
- ✅ **Simplified Card Design**: Midnight black backgrounds with consistent gradient titles using clean retro fonts
- ✅ **Enhanced Button Styling**: Primary buttons in Neon Orange, secondary actions in Hot Magenta, special effects in Electric Purple
- ✅ **Complete Communications Hub**: Full-featured "Whispers in the Dark" section with tabbed interface (Public Board, Private Messages, Announcements) and live updates
- ✅ **Game Master Dashboard**: Comprehensive admin interface with voting analytics, message monitoring, and announcement broadcasting  
- ✅ **Enhanced Branding**: Changed app name to "The Traitors" with custom skull logo throughout
- ✅ **Private Message Notifications**: Top-level notification system for received private messages with reply functionality
- ✅ **Spooky Player Symbols**: Automatic random symbol assignment (👻💀🦇🕷️etc.) for each player profile
- ✅ **Muted Green Accent Color**: Added muted green (#92b78c) as seventh accent color exclusively for dashboard sidebar navigation
- ✅ **Streamlined UI**: Removed Recent Activity section from dashboard and Settings feature from profile page per user request
- ✅ **Navigation Bug Fix**: Resolved mysterious "0" appearing between Suspicion Meter and Profile buttons in navigation bar

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