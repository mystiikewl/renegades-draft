# Production Deployment Guide for Renegades Draft

This guide will walk you through deploying the Renegades Draft application to production using Netlify and Supabase.

## Prerequisites

1. A GitHub account (already set up with the repository)
2. A Netlify account
3. A Supabase account

## Step 1: Configure Supabase for Production

### 1.1 Create a Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Note down your Project URL and anon key (you'll need these for Netlify)

### 1.2 Set Up Database
1. Run the SQL migrations in `supabase/migrations/` in order:
   - Go to SQL Editor in your Supabase project
   - Run each migration file from the `supabase/migrations/` directory
2. Or use the Supabase CLI:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

### 1.3 Configure Authentication
1. Go to Authentication > Settings
2. Update Site URL to your Netlify domain (you'll get this after deploying)
3. Add your Netlify domain to Additional Redirect URLs:
   - `https://your-netlify-domain.netlify.app/**`
4. Enable Email signup if not already enabled

## Step 2: Deploy to Netlify

### 2.1 Connect to GitHub
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Select GitHub and authorize Netlify to access your repositories
4. Select `mystiikewl/renegades-draft` repository

### 2.2 Configure Build Settings
Set the following in the Netlify deploy settings:
- **Branch to deploy**: master
- **Base directory**: renegades-draft-central
- **Build command**: npm run build
- **Publish directory**: dist

### 2.3 Set Environment Variables
In Netlify site settings, go to "Build & deploy" > "Environment" and add:
- `VITE_SUPABASE_URL` = Your Supabase Project URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

## Step 3: Update Supabase with Netlify Domain

After your site is deployed:
1. Note your Netlify domain (e.g., `your-site-name.netlify.app`)
2. Go back to Supabase Authentication > Settings
3. Add your Netlify domain to Additional Redirect URLs:
   - `https://your-site-name.netlify.app/**`

## Step 4: Custom Domain (Optional)

If you want to use a custom domain:
1. Purchase a domain from your preferred registrar
2. In Netlify, go to "Domain settings" > "Custom domains"
3. Add your domain
4. Follow the DNS configuration instructions
5. Update Supabase auth redirect URLs to include your custom domain

## Step 5: Testing

1. Visit your Netlify site URL
2. Test user signup and login
3. Test draft functionality with multiple browser windows
4. Verify real-time updates work
5. Test all admin functionality

## Monitoring and Maintenance

### Error Tracking
Consider setting up Sentry for error tracking:
1. Create a Sentry account
2. Install Sentry SDK in your app:
   ```bash
   npm install @sentry/react @sentry/tracing
   ```
3. Configure in your main.tsx file

### Performance Monitoring
Enable Netlify Analytics:
1. Go to your site settings in Netlify
2. Navigate to "Analytics"
3. Enable Netlify Analytics

## Backup Strategy

1. Regularly export your Supabase database:
   - Use Supabase's database export feature
   - Or set up automated backups with Supabase CLI
2. Keep a local backup of your player data CSV files

## Troubleshooting

### Common Issues

1. **Site not building**: Check build logs in Netlify for errors
2. **Authentication not working**: Verify environment variables and redirect URLs
3. **Real-time not working**: Check browser console for WebSocket errors
4. **Database connection issues**: Verify Supabase credentials

### Useful Commands for Debugging

1. Check build locally:
   ```bash
   cd renegades-draft-central
   npm run build
   npm run preview
   ```

2. Check environment variables:
   ```bash
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

## Updating Your Production Site

1. Make changes in your local repository
2. Commit and push to GitHub
3. Netlify will automatically deploy the new version
4. For database schema changes, update your Supabase migrations and run:
   ```bash
   supabase db push
   ```

## Security Considerations

1. Never commit secrets to your repository
2. Use environment variables for all credentials
3. Regularly review Supabase Row Level Security policies
4. Keep dependencies updated