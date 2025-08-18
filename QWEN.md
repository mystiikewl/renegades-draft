# Project Context for Qwen Code

## Project Overview

The Renegades Draft project is an NBA Fantasy Draft application built with React, TypeScript, and Supabase. It's designed to allow friends to conduct real fantasy basketball drafts with live updates and real player statistics.

### Main Technologies

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: shadcn-ui with Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Backend**: Supabase (database, authentication, real-time subscriptions)
- **Routing**: React Router DOM
- **Data Visualization**: Recharts
- **Icons**: Lucide React

### Project Structure

```
.
├── .kiro/                    # Project specifications and documentation
├── documentation/           # Additional project documentation
├── renegades-draft-central/ # Main application code
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── integrations/    # External service integrations (Supabase)
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper functions
│   ├── supabase/            # Supabase migrations
│   ├── package.json         # Project dependencies and scripts
│   └── README.md            # Project documentation
├── nba_player_stats_complete.csv  # NBA player data
├── parse_players.py        # Data processing script
└── credentials.md          # Project credentials
```

### Core Features

1. **Real-time Drafting**: Live updates across all connected clients when picks are made
2. **Player Database**: Real NBA player statistics from Supabase
3. **Advanced Filtering**: Multi-position filtering, stat range filters, and sorting options
4. **Team Management**: Team creation, assignment, and roster management
5. **Keeper System**: Players can be kept for the next season
6. **Draft Trading**: Teams can trade draft picks
7. **League Analysis**: Comprehensive team and player performance metrics
8. **Responsive Design**: Works on desktop and mobile devices

## Development Workflow

### Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`

### Key Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Data Management
npm run import-players  # Import player data from CSV
```

### Project Architecture

The application follows a modern React architecture with:

1. **Component-Based UI**: Reusable components in `src/components/`
2. **Hook-Based Logic**: Custom hooks for data fetching and business logic in `src/hooks/`
3. **Supabase Integration**: Database operations and real-time subscriptions in `src/integrations/supabase/`
4. **Page-Based Routing**: Route components in `src/pages/`
5. **Type Safety**: Comprehensive TypeScript types in `src/types/`

### Data Flow

1. **Data Fetching**: React Query hooks fetch data from Supabase
2. **State Management**: React Query manages server state, React manages local UI state
3. **Real-time Updates**: Supabase real-time subscriptions push updates to all clients
4. **User Actions**: UI interactions trigger Supabase mutations, which then propagate via real-time subscriptions

### Development Conventions & Best Practices

#### React Best Practices

1. **Component Structure**: Components are organized by feature/functionality following single responsibility principle
2. **Hook Patterns**: Custom hooks encapsulate data fetching and business logic to promote reusability
3. **Type Safety**: TypeScript is used throughout with strict typing for better code reliability
4. **UI Consistency**: shadcn-ui components ensure consistent design and user experience
5. **Error Handling**: Comprehensive error handling with user feedback for all operations
6. **Performance Optimization**: Memoization, virtual scrolling, and lazy loading for better performance
7. **Component Composition**: Favor composition over inheritance, building complex UIs from smaller components
8. **State Management**: Lift state up when needed, but keep component state local when possible

#### Supabase Best Practices

1. **Database Design**: Follow normalization principles with appropriate relationships
2. **Row Level Security**: Implement RLS policies for data access control based on user permissions
3. **Real-time Subscriptions**: Use efficiently to minimize bandwidth and maximize responsiveness
4. **RPC Functions**: Leverage stored procedures for complex operations that require database-level logic
5. **Model Context Protocol**: Integrate MCP for enhanced database operations and better developer experience
6. **Authentication**: Secure user authentication with proper session management
7. **Data Validation**: Implement both client-side and server-side validation for data integrity

#### Single Responsibility Principle

1. **Components**: Each component should have one reason to change and be responsible for one piece of functionality
2. **Hooks**: Custom hooks should encapsulate a single concern or related set of operations
3. **Utility Functions**: Functions in `utils/` and `lib/` should do one thing and do it well
4. **Pages**: Page components should orchestrate components rather than implement complex logic directly

#### Component-Based Workflow

1. **Atomic Design**: Build UI using atoms (basic components), molecules (combinations), and organisms (complex components)
2. **Reusability**: Design components to be reusable across different parts of the application
3. **Props Interface**: Define clear, typed interfaces for component props
4. **Separation of Concerns**: Separate UI components from business logic using hooks
5. **Composition**: Build complex UIs by composing simpler components together

### Key Implementation Details

1. **Authentication**: Supabase authentication with user profiles and team assignments
2. **Draft Logic**: Snake draft order with configurable rounds, real-time pick updates
3. **Player Data**: Comprehensive NBA statistics with rankings and performance metrics
4. **Real-time Presence**: Track active teams during the draft
5. **Data Validation**: Input validation for all user actions
6. **Keeper System**: Players can be designated as keepers for future seasons
7. **Draft Trading**: Teams can trade draft picks with other teams
8. **League Analysis**: Detailed statistics and visualizations for team performance

### Recent Enhancements

1. **Refactored Components**: Major refactoring of components for better organization and maintainability
2. **Enhanced Admin Features**: Comprehensive admin dashboard for team and user management
3. **Improved UI/UX**: Better responsive design and mobile experience
4. **Advanced Filtering**: Enhanced player filtering capabilities in the draft interface
5. **Performance Optimizations**: Virtual scrolling and memoization for better performance with large datasets
6. **Supabase MCP Integration**: Working Model Context Protocol integration for Supabase operations

### Current Development Status

Based on the implementation plan in `.kiro/specs/production-ready-draft-app/tasks.md`, the project has completed:

- [x] Set up data import infrastructure and upload NBA player data
- [x] Replace mock data with Supabase data integration
- [x] Implement real-time draft pick functionality
- [x] Enhance PlayerPool component with advanced filtering and search
- [x] Refactor components and pages for better organization
- [x] Implement working Supabase Model Context Protocol (MCP) integration

Currently working on:
- [ ] Improve draft pick validation and error handling
- [ ] Enhance team management and user assignment
- [ ] Add comprehensive testing suite
- [ ] Implement additional league analysis features

### Supabase Integration

The application uses Supabase for:

1. **Database**: Player, team, draft pick, user profile, and keeper tables
2. **Authentication**: User signup, login, and session management
3. **Real-time**: Live updates for draft picks, team presence, and roster changes
4. **Row Level Security**: Data access control based on user permissions
5. **RPC Functions**: Custom database functions for team claiming and user assignment
6. **Model Context Protocol**: Integration with MCP for enhanced database operations

The Supabase client is configured in `src/integrations/supabase/client.ts` with the project URL and public key.

The project has a fully configured Supabase MCP server in `.gemini/settings.json` that provides access to:
- Branch management (create, list, delete, merge, reset, rebase)
- Database operations (list tables, extensions, migrations, apply migrations)
- SQL execution capabilities
- Project deployment functions
- Documentation search
- Edge function deployment

### Testing

The project currently uses manual testing during development. For future enhancements, consider:

1. **Unit Testing**: React Testing Library for components
2. **Integration Testing**: Supabase operations with test data
3. **End-to-End Testing**: Cypress or Playwright for user flows

### Deployment

The application can be deployed through Lovable's built-in deployment system by clicking "Share -> Publish" in the Lovable project interface. For custom deployment, build the application with `npm run build` and serve the `dist/` folder.