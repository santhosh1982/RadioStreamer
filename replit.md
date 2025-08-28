# RadioWave - AI-Powered Radio Streaming Platform

## Overview

RadioWave is a modern web radio streaming platform that allows users to discover, stream, and record radio stations from around the world. The application features AI-powered search capabilities, user authentication via Replit Auth, real-time streaming with WebSocket support, and comprehensive radio station management. Users can create personalized favorites, record stations for later playback, and interact with an AI assistant for intelligent station recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: Custom WebSocket hook for live streaming updates and recording status

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework using ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL as the primary database
- **Authentication**: Replit Auth integration with OpenID Connect for user authentication
- **Session Management**: Express sessions stored in PostgreSQL using connect-pg-simple
- **API Design**: RESTful endpoints with WebSocket support for real-time features

### Data Layer
- **Primary Database**: PostgreSQL via Neon serverless platform
- **Schema Management**: Drizzle Kit for database migrations and schema versioning
- **Key Entities**:
  - Users (for Replit Auth integration)
  - Radio Stations (with metadata like genre, location, streaming URLs)
  - Recordings (user-created audio recordings with file management)
  - Favorites (user's saved stations)
  - Chat Conversations (AI assistant interaction history)
  - Sessions (authentication session storage)

### Core Features
- **Radio Streaming**: Real-time audio streaming with WebSocket coordination for playback state
- **Recording System**: Server-side audio capture and file storage with duration tracking
- **AI Assistant**: OpenRouter integration (using GPT-4o) for intelligent station recommendations and search
- **User Management**: Complete user profiles with authentication state management
- **Favorites System**: Personalized station collections with quick access

### External Dependencies
- **Neon Database**: Serverless PostgreSQL hosting for primary data storage
- **OpenRouter API**: AI model access via OpenRouter (using OpenAI's GPT-4o) for AI-powered station search and recommendations
- **Replit Authentication**: OAuth provider for user identity and session management
- **Radix UI**: Accessible component primitives for complex UI interactions
- **TanStack Query**: Server state synchronization and caching layer
- **WebSocket Server**: Built-in Node.js WebSocket support for real-time features

### Development Tools
- **TypeScript**: Full type safety across client and server with shared schema types
- **ESBuild**: Fast bundling for production server builds
- **Vite**: Development server with hot module replacement and optimized builds
- **Tailwind CSS**: Utility-first styling with custom design tokens and dark theme support