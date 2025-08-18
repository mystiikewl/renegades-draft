@echo off
REM This script helps set up the Supabase database for the Renegades Draft application
REM Make sure you have the Supabase CLI installed: https://supabase.com/docs/guides/cli

REM Check if Supabase CLI is installed
where supabase >nul 2>&1
if %errorlevel% neq 0 (
    echo Supabase CLI could not be found. Please install it first:
    echo npm install -g supabase
    pause
    exit /b 1
)

REM Link to your Supabase project
echo Please enter your Supabase project reference (found in your project settings):
set /p project_ref=""

supabase link --project-ref %project_ref%

REM Push the database migrations
echo Pushing database migrations...
supabase db push

REM Deploy functions
echo Deploying Supabase functions...
supabase functions deploy

echo Supabase setup complete!
echo Remember to update your authentication redirect URLs in the Supabase dashboard
echo to include your Netlify domain after deployment.
pause