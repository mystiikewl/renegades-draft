# Renegades Draft Production Deployment Checklist

This checklist will guide you through all the steps needed to deploy your Renegades Draft application to production.

## Pre-Deployment Checklist

### GitHub Repository
- [x] Code pushed to GitHub repository (mystiikewl/renegades-draft)
- [x] README.md created and pushed
- [x] DEPLOYMENT_GUIDE.md created and pushed
- [x] Supabase setup scripts created and pushed

### Local Environment
- [ ] Node.js installed (version 16 or higher)
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Netlify CLI installed (`npm install -g netlify-cli`)

## Supabase Setup

### Project Creation
- [ ] Create new Supabase project at https://app.supabase.com/
- [ ] Note down Project URL and anon key

### Database Setup
- [ ] Link local project to Supabase project:
      `supabase link --project-ref YOUR_PROJECT_REF`
- [ ] Push database migrations:
      `supabase db push`
- [ ] Verify all tables are created (players, teams, profiles, etc.)

### Authentication Configuration
- [ ] Enable Email signup in Supabase Auth settings
- [ ] Note default redirect URLs for later use

### Functions Deployment
- [ ] Deploy Supabase functions:
      `supabase functions deploy`

## Netlify Deployment

### Site Creation
- [ ] Log in to Netlify at https://app.netlify.com/
- [ ] Click "New site from Git"
- [ ] Connect to GitHub and select mystiikewl/renegades-draft repository
- [ ] Configure build settings:
      - Base directory: renegades-draft-central
      - Build command: npm run build
      - Publish directory: dist

### Environment Variables
- [ ] In Netlify site settings, go to "Build & deploy" > "Environment"
- [ ] Add environment variables:
      - `VITE_SUPABASE_URL` = Your Supabase Project URL
      - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

### Initial Deployment
- [ ] Trigger initial deployment
- [ ] Note Netlify-provided domain (e.g., your-site-name.netlify.app)

## Post-Deployment Configuration

### Supabase Redirect URLs Update
- [ ] Go to Supabase Authentication > Settings
- [ ] Add Netlify domain to Additional Redirect URLs:
      - `https://your-netlify-domain.netlify.app/**`
      - `http://localhost:8080/**` (for local development)

### Custom Domain (Optional)
- [ ] Purchase domain if needed
- [ ] In Netlify, go to "Domain settings" > "Custom domains"
- [ ] Add custom domain and follow DNS configuration
- [ ] Update Supabase auth redirect URLs to include custom domain

## Testing

### Functional Testing
- [ ] Test user signup and login
- [ ] Test draft creation and team assignment
- [ ] Test player selection and draft functionality
- [ ] Test real-time updates with multiple browser windows
- [ ] Test admin functionality (team management, draft settings)
- [ ] Test keeper system
- [ ] Test draft trading functionality
- [ ] Test league analysis features

### Cross-Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile browsers

### Performance Testing
- [ ] Verify site loads quickly
- [ ] Check real-time updates are responsive
- [ ] Test with multiple simultaneous users

## Monitoring and Analytics

### Error Tracking
- [ ] Set up Sentry or similar error tracking service
- [ ] Configure error boundaries in React app

### Performance Monitoring
- [ ] Enable Netlify Analytics
- [ ] Set up Google Analytics or similar service

## Security Review

### Environment Variables
- [ ] Confirm no secrets are hardcoded in the repository
- [ ] Verify all credentials are in environment variables

### Authentication
- [ ] Review Row Level Security policies
- [ ] Test unauthorized access to restricted features
- [ ] Verify session management works correctly

### Input Validation
- [ ] Test form inputs with invalid data
- [ ] Verify proper error handling for user inputs

## Backup and Recovery

### Database Backups
- [ ] Set up regular Supabase database backups
- [ ] Test database export functionality

### Code Backups
- [ ] Ensure GitHub repository is up to date
- [ ] Consider setting up automated backups of critical data

## Documentation

### User Documentation
- [ ] Create user guide for league administrators
- [ ] Create user guide for draft participants

### Developer Documentation
- [ ] Update API documentation if needed
- [ ] Document any deployment-specific configurations

## Go-Live

### Final Testing
- [ ] Perform full end-to-end testing
- [ ] Verify all features work as expected
- [ ] Test with actual users if possible

### Communication
- [ ] Announce launch to intended users
- [ ] Provide support contact information

### Monitoring
- [ ] Set up alerts for site downtime
- [ ] Monitor error tracking for new issues
- [ ] Watch performance metrics

## Post-Launch

### User Feedback
- [ ] Collect feedback from early users
- [ ] Address any critical issues immediately

### Optimization
- [ ] Analyze performance data
- [ ] Implement performance improvements if needed

### Future Planning
- [ ] Plan feature enhancements
- [ ] Schedule regular maintenance windows

---

**Note**: This checklist should be completed in order. Some steps depend on previous steps being completed successfully.