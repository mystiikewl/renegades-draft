# Renegades Draft Administrator and Developer Guide

This guide is intended for league administrators and developers who need to understand the technical aspects of the Renegades Draft application.

## Table of Contents
1. [Administrator Guide](#administrator-guide)
2. [Developer Guide](#developer-guide)
3. [Deployment](#deployment)
4. [Monitoring and Maintenance](#monitoring-and-maintenance)
5. [Troubleshooting](#troubleshooting)

## Administrator Guide

### Setting Up a New League

#### 1. Create Teams
1. Navigate to the Admin Dashboard
2. Go to the Teams section
3. Click "Add Team" for each team in your league
4. Assign team names and draft order positions

#### 2. Invite Users
1. In the Admin Dashboard, go to the Users section
2. Click "Invite User"
3. Enter the user's email address
4. Assign the user to a team (optional)
5. The user will receive an email invitation to join

#### 3. Configure Draft Settings
1. Navigate to Draft Settings in the Admin Dashboard
2. Set the number of rounds (roster size)
3. Confirm the league size (number of teams)
4. Select the draft type (snake, linear, or manual)
5. Set pick time limits if desired
6. Configure the draft order by dragging teams

### Managing the Draft

#### During the Draft
1. Monitor the draft progress in real-time
2. Ensure all teams are connected
3. Assist teams with technical issues as needed
4. Verify draft picks are recorded correctly

#### Handling Issues
1. **Disconnected Teams**: Contact the team to resolve connection issues
2. **Missed Picks**: Use admin controls to make picks on behalf of teams
3. **Draft Order Disputes**: Verify draft settings and order
4. **Player Selection Errors**: Contact developers for pick corrections (avoid if possible)

### Post-Draft Management

#### Keeper Management
1. Review keeper selections with league rules
2. Approve or reject keeper requests as needed
3. Adjust draft pick costs based on keepers

#### Season Reset
At the end of each season:
1. Navigate to Admin Dashboard
2. Use the "Reset Draft" function to prepare for next season
3. Review and update team information
4. Invite returning users or new participants

### User Management

#### Assigning Teams
1. In the Users section, find the user
2. Click "Edit" for that user
3. Select the team to assign from the dropdown
4. Save changes

#### Granting Admin Privileges
1. In the Users section, find the user
2. Click "Edit" for that user
3. Check the "Admin" box
4. Save changes

#### Removing Users
1. In the Users section, find the user
2. Click "Delete" for that user
3. Confirm the deletion (irreversible)

## Developer Guide

### Project Structure

```
renegades-draft-central/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # External service integrations
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
├── public/             # Static assets
├── scripts/            # Utility scripts
└── supabase/           # Supabase migrations
```

### Key Technologies

- **React** with TypeScript for UI development
- **Vite** for build tooling
- **Supabase** for backend services
- **shadcn/ui** and **Tailwind CSS** for UI components
- **React Query** for data fetching and caching
- **Vitest** and **React Testing Library** for testing

### Component Architecture

#### Directory Structure
- `components/admin/` - Admin-specific components
- `components/draft/` - Draft-related components
- `components/team/` - Team-related components
- `components/ui/` - Reusable UI components
- `components/league-analysis/` - Analytics and visualization components

#### Component Design Principles
1. **Single Responsibility**: Each component should have one clear purpose
2. **Reusability**: Components should be designed for reuse
3. **Composition**: Complex UIs should be built by composing simpler components
4. **Type Safety**: All components should use TypeScript interfaces for props

### Data Flow

#### Supabase Integration
1. **Client Initialization**: Located in `src/integrations/supabase/client.ts`
2. **Data Fetching**: Custom hooks in `src/hooks/` for each data entity
3. **Real-time Updates**: Subscriptions in hooks for live data updates
4. **Mutations**: Functions in hooks for creating/updating data

#### State Management
1. **Server State**: Managed with React Query
2. **Local UI State**: Managed with React useState/useReducer
3. **Global State**: Minimal global state with React Context for authentication

### Testing Strategy

#### Test Structure
- Component tests in `*.test.tsx` files alongside components
- Hook tests in `*.test.ts` files alongside hooks
- Utility function tests in `*.test.ts` files

#### Testing Libraries
- **Vitest**: Test runner
- **React Testing Library**: Component testing
- **jsdom**: DOM environment simulation

#### Test Coverage Goals
- Critical user flows: 100%
- Components: 80%+
- Hooks: 80%+
- Utility functions: 90%+

### Adding New Features

#### 1. Create Component
1. Determine the appropriate directory in `src/components/`
2. Create the component file with proper TypeScript interfaces
3. Implement the UI and functionality
4. Add TypeScript types as needed

#### 2. Create Tests
1. Create a test file alongside the component
2. Test rendering and user interactions
3. Mock external dependencies (Supabase, etc.)
4. Ensure tests pass

#### 3. Integrate with Data
1. Create or update hooks in `src/hooks/` for data needs
2. Implement proper error handling
3. Add loading states
4. Implement real-time subscriptions if needed

#### 4. Add Routing
1. Update routes in `src/App.tsx` if needed
2. Add navigation links in appropriate components

### Code Quality Standards

#### TypeScript
1. Avoid `any` types (ESLint enforced)
2. Use strict mode
3. Define interfaces for all props and state
4. Use generics where appropriate

#### React Best Practices
1. Use functional components with hooks
2. Implement proper useEffect dependencies
3. Memoize expensive computations
4. Optimize re-renders with useMemo/useCallback

#### Styling
1. Use Tailwind CSS utility classes
2. Follow existing design patterns
3. Use shadcn/ui components when available
4. Maintain responsive design

## Deployment

### Production Deployment
The application is deployed through Lovable:
1. Open the Lovable project
2. Click "Share -> Publish"
3. The application will be deployed automatically

### Environment Variables
The application uses the following environment variables:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

These are automatically configured in the Lovable deployment process.

### Build Process
```bash
npm run build
```
This creates an optimized production build in the `dist/` directory.

### Development Deployment
For development/testing:
1. Fork the repository
2. Set up your own Supabase project
3. Configure environment variables
4. Run `npm run dev` for local development

## Monitoring and Maintenance

### Error Tracking
The application should integrate with Sentry or similar error tracking service:
1. Monitor frontend errors
2. Track performance issues
3. Set up alerts for critical errors

### Performance Monitoring
1. Monitor page load times
2. Track API response times
3. Monitor real-time subscription performance

### Database Maintenance
1. Regular backups of Supabase database
2. Monitor database performance
3. Optimize queries as needed
4. Update Row Level Security policies

### Security Updates
1. Regularly update dependencies
2. Monitor for security vulnerabilities
3. Review authentication and authorization
4. Audit user permissions

### User Support
1. Set up a support channel for users
2. Document common issues and solutions
3. Monitor user feedback
4. Implement feature requests based on user needs

## Troubleshooting

### Common Development Issues

#### 1. Supabase Connection Issues
**Symptoms**: Data not loading, authentication failures
**Solutions**:
- Verify environment variables
- Check Supabase project status
- Confirm network connectivity
- Review Row Level Security policies

#### 2. Build Failures
**Symptoms**: Build process fails or produces errors
**Solutions**:
- Check for TypeScript errors
- Verify all dependencies are installed
- Review recent code changes
- Clear build cache and retry

#### 3. Test Failures
**Symptoms**: Tests failing in CI or locally
**Solutions**:
- Update snapshots if UI changes
- Check for missing mocks
- Verify test data matches expectations
- Review recent code changes

### Production Issues

#### 1. Performance Problems
**Symptoms**: Slow page loads, delayed updates
**Solutions**:
- Check network connectivity
- Review database query performance
- Optimize component rendering
- Implement caching strategies

#### 2. Real-time Sync Issues
**Symptoms**: Data not updating across clients
**Solutions**:
- Verify real-time subscriptions
- Check Supabase WebSocket connections
- Review subscription cleanup
- Monitor for connection drops

#### 3. Authentication Problems
**Symptoms**: Users unable to sign in or access data
**Solutions**:
- Check Supabase Auth configuration
- Verify user permissions
- Review session management
- Confirm email verification settings

### Debugging Tools

#### Browser Developer Tools
1. Network tab to monitor API requests
2. Console for error messages
3. React DevTools for component inspection
4. Performance tab for optimization

#### Supabase Dashboard
1. Database query monitoring
2. Authentication logs
3. Real-time subscription status
4. Storage usage

#### Logging
1. Implement structured logging
2. Log important user actions
3. Log errors with context
4. Monitor logs for patterns

### Contact Support
For issues not covered in this guide:
1. Check the project documentation
2. Review recent code changes
3. Contact the development team
4. File issues in the project repository