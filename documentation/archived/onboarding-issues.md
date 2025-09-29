# Onboarding Process Issues - Documentation

## Current Issues

### 1. Users with claimed teams are not redirected to the draft page
**Problem**: When a user who already has a claimed team signs in, they are still redirected to the onboarding page instead of being sent directly to the draft page.

**Expected Behavior**: Users who have completed onboarding and have a team should be redirected directly to the draft page.

### 2. New users cannot claim a team
**Problem**: New users attempting to claim a team receive an error:
```
Failed to claim team: invalid input syntax for type integer: "[UUID]"
```

**Expected Behavior**: New users should be able to successfully claim an available team.

## Changes Made

### 1. Fixed Type Mismatch in AuthContext
- **Issue**: The AuthContext was expecting a `team` property on the profile object, but the database schema has a `team_id` field that references the teams table.
- **Fix**: Updated AuthContext to properly fetch team data by first getting the profile with `team_id`, then separately fetching the team details if a `team_id` exists.

### 2. Updated Redirect Logic
- **Issue**: The redirect logic in multiple components was checking for `profile?.team?.id` which would always be undefined due to the type mismatch.
- **Fix**: Updated all components (AuthForm, ProtectedRoute, Onboarding) to check for `profile?.team` instead.

### 3. Created Database Migration to Fix claim_team Function
- **Issue**: The `claim_team` function might have a type mismatch where it expects an integer but receives a UUID.
- **Fix**: Created a new migration file `20250817010000_fix_claim_team_function.sql` that explicitly defines the `target_team_id` parameter as `uuid`.

## Remaining Issues

### 1. Redirect Logic Still Not Working
Despite the updates to check for `profile?.team`, users with teams are still being redirected to the onboarding page. This suggests there may be:

- A timing issue where the profile data isn't fully loaded when the redirect decision is made
- A problem with how the team data is being fetched or structured
- An issue with the ProtectedRoute or AuthForm redirect logic

### 2. claim_team Function Error Persists
The error message indicates that the database function is still expecting an integer rather than a UUID. This could be because:

- The migration didn't run successfully
- There's a cached version of the function that wasn't updated
- There's another version of the function that's being called instead

## Next Steps

### For Issue 1 (Redirect Logic):
1. Add console logging to verify the profile data structure and loading state
2. Check if the team data is actually being fetched and attached to the profile
3. Verify that the onboardingComplete flag is being set correctly
4. Test the redirect logic in isolation

### For Issue 2 (claim_team Function):
1. Verify that the new migration ran successfully in the database
2. Check the actual function definition in the database to confirm the parameter type
3. Consider creating a new function with a different name if the existing one can't be updated
4. Test the function directly with a simple SQL query

## Files Modified

1. `src/contexts/AuthContext.tsx` - Fixed profile and team data structure
2. `src/pages/Onboarding.tsx` - Updated redirect logic
3. `src/components/ProtectedRoute.tsx` - Updated redirect logic
4. `src/components/AuthForm.tsx` - Updated redirect logic
5. `supabase/migrations/20250817010000_fix_claim_team_function.sql` - Fixed claim_team function definition