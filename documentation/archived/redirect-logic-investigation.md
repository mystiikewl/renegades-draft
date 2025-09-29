# Redirect Logic Investigation

## Current State
Users with teams are still being redirected to the onboarding page instead of the draft page after signing in.

## Components Involved
1. `AuthContext.tsx` - Provides user profile and onboarding status
2. `AuthForm.tsx` - Handles authentication and initial redirect
3. `ProtectedRoute.tsx` - Handles route protection and redirects
4. `Onboarding.tsx` - The onboarding page itself

## Data Flow
1. User signs in
2. `AuthForm` gets session and profile data
3. Redirect decision is made based on `onboardingComplete` and `profile?.team`
4. If user has team and completed onboarding, they should go to `/` (draft page)
5. Otherwise, they go to `/onboarding`

## Potential Issues

### 1. Timing Issues
- Profile data might not be fully loaded when redirect decision is made
- Race conditions between AuthContext updates and redirect logic

### 2. Data Structure Issues
- Profile data might not be structured as expected
- Team data might not be properly attached to profile
- `onboardingComplete` flag might not be set correctly

### 3. Logic Issues
- Redirect conditions might not be properly evaluated
- Path matching might not work as expected

## Debugging Steps

### 1. Add Console Logging
Add detailed console logging in each component to trace the data flow:

In `AuthContext.tsx`:
```typescript
console.log('AuthContext - Profile:', profile);
console.log('AuthContext - Onboarding Complete:', onboardingComplete);
console.log('AuthContext - Team:', profile?.team);
```

In `AuthForm.tsx`:
```typescript
console.log('AuthForm - Profile:', profile);
console.log('AuthForm - Onboarding Complete:', onboardingComplete);
console.log('AuthForm - Team:', profile?.team);
console.log('AuthForm - Redirect Decision:', getRedirectUrl(onboardingComplete, profile));
```

In `ProtectedRoute.tsx`:
```typescript
console.log('ProtectedRoute - Profile:', profile);
console.log('ProtectedRoute - Onboarding Complete:', onboardingComplete);
console.log('ProtectedRoute - Team:', profile?.team);
console.log('ProtectedRoute - Current Path:', window.location.pathname);
```

In `Onboarding.tsx`:
```typescript
console.log('Onboarding - Profile:', profile);
console.log('Onboarding - Onboarding Complete:', onboardingComplete);
console.log('Onboarding - Team:', profile?.team);
```

### 2. Verify Data Structure
Check that the profile object has the expected structure:
- `profile.team` should be an object with team details, not just an ID
- `profile.onboarding_complete` should be a boolean

### 3. Test Redirect Logic Isolation
Create a simple test component that displays the redirect decision logic to verify it works correctly:

```typescript
const TestRedirect = () => {
  const { profile, onboardingComplete } = useAuth();
  
  const shouldRedirectToDraft = profile?.team && onboardingComplete;
  const shouldRedirectToOnboarding = !profile?.team || !onboardingComplete;
  
  return (
    <div>
      <p>Profile: {JSON.stringify(profile)}</p>
      <p>Onboarding Complete: {String(onboardingComplete)}</p>
      <p>Should redirect to draft: {String(shouldRedirectToDraft)}</p>
      <p>Should redirect to onboarding: {String(shouldRedirectToOnboarding)}</p>
    </div>
  );
};
```

## Files to Check

1. `src/contexts/AuthContext.tsx` - Profile data structure and loading
2. `src/components/AuthForm.tsx` - Initial redirect logic
3. `src/components/ProtectedRoute.tsx` - Route protection and redirects
4. `src/pages/Onboarding.tsx` - Onboarding page logic