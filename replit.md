# Overview

This is a modern fitness tracking web application built as a full-stack solution with a mobile-first design. The app allows users to create workout plans, track exercises, monitor progress, and manage their fitness journey through an intuitive interface with a glass-morphism design aesthetic.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with custom CSS variables for theming and glass-morphism effects
- **UI Components**: Radix UI primitives with shadcn/ui for consistent, accessible components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Animation**: Framer Motion for smooth transitions and micro-interactions
- **Form Handling**: React Hook Form with Zod for validation

## Backend Architecture  
- **Runtime**: Node.js with Express.js for the REST API server
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with bcrypt for password hashing
- **File Uploads**: Multer middleware for handling image and video uploads
- **Development**: Vite for fast development server and hot module replacement

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with schema-first approach for type safety
- **Migrations**: Drizzle Kit for database schema migrations
- **Connection**: Connection pooling with @neondatabase/serverless
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple

## Database Schema Design
The application uses a comprehensive relational schema:
- **Users**: Core user profiles with physical metrics and goals
- **Exercises**: Exercise library with custom exercise support
- **Workout Plans**: Weekly workout scheduling with muscle group targeting
- **Workout Sessions**: Individual workout tracking with timestamps
- **Exercise Logs**: Set-by-set exercise completion tracking
- **Weight Logs**: Progress tracking over time

## Authentication and Authorization
- **Strategy**: Session-based authentication stored in PostgreSQL
- **Password Security**: bcrypt hashing with salt rounds
- **User Context**: React Context API for global authentication state
- **Persistence**: localStorage backup for offline-first experience
- **Route Protection**: Client-side route guards based on authentication status

# External Dependencies

## Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with schema validation
- **File Storage**: Local filesystem storage for uploaded media files

## UI and Design System
- **Radix UI**: Headless UI primitives for accessibility and customization
- **shadcn/ui**: Pre-built component library with consistent styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Framer Motion**: Animation library for smooth user interactions

## Development and Build Tools
- **Vite**: Fast development server with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind and autoprefixer

## Runtime Dependencies
- **TanStack Query**: Server state management with intelligent caching
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Schema validation for type-safe data handling
- **date-fns**: Date manipulation and formatting utilities
- **Wouter**: Lightweight routing solution for single-page application navigation