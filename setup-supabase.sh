#!/bin/bash

# This script helps set up the Supabase database for the Renegades Draft application
# Make sure you have the Supabase CLI installed: https://supabase.com/docs/guides/cli

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI could not be found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Link to your Supabase project
echo "Please enter your Supabase project reference (found in your project settings):"
read project_ref

supabase link --project-ref $project_ref

# Push the database migrations
echo "Pushing database migrations..."
supabase db push

# Deploy functions
echo "Deploying Supabase functions..."
supabase functions deploy

echo "Supabase setup complete!"
echo "Remember to update your authentication redirect URLs in the Supabase dashboard"
echo "to include your Netlify domain after deployment."