# Team Selection Issue Documentation

## Problem Description
When new users go through the onboarding process, they are unable to see available teams to claim, even though there are 10 teams in total and only 1 is already claimed.

## Root Cause Analysis

### 1. Redundant Filtering Logic
The issue was caused by conflicting filtering logic at two levels:

1. **Database Level (RLS Policy)**: The `teams` table has a Row Level Security policy that already filters teams to only show unclaimed ones:
   ```sql
   create policy "Authenticated users can view available teams" on public.teams
     for select
     using (
       auth.role() = 'authenticated' and
       not exists (
         select 1 from public.profiles where profiles.team_id = teams.id
       )
     );
   ```

2. **Application Level (useTeams Hook)**: The hook was also applying client-side filtering with a complex join query that was causing issues:
   ```javascript
   // Old implementation
   .select('*, profiles!left(id)') // Complex join
   // ... 
   // Redundant client-side filtering
   const filteredData = data.filter(team => team.profiles === null || team.profiles.length === 0);
   ```

### 2. Data Structure Mismatch
The client-side filtering logic was not correctly handling the data structure returned by the Supabase query with the left join.

## Solution Implemented

### 1. Fixed useTeams Hook
Modified `src/hooks/useTeams.ts` to:
- Remove the complex join query
- Eliminate redundant client-side filtering
- Simply fetch all teams (which are already filtered by RLS)

```typescript
// New implementation
export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return data.map(team => ({
        id: team.id,
        name: team.name,
        owner_email: team.owner_email,
        created_at: team.created_at,
        updated_at: team.updated_at,
      }));
    },
  });
};
```

### 2. Updated TeamSelection Component
Modified `src/components/TeamSelection.tsx` to remove the redundant filtering logic:

```typescript
// Before
const availableTeams = teamsData.filter(team => {
  return !team.owner_email;
});

// After
const availableTeams = teamsData;
```

## Why This Fixes the Issue

1. **Eliminates Conflicting Logic**: By removing the client-side filtering, we prevent conflicts with the database-level RLS policy.

2. **Simplifies Data Flow**: The application now relies solely on the database RLS policy to determine which teams are available, which is the correct approach.

3. **Reduces Complexity**: Removing the unnecessary join query and client-side filtering makes the code simpler and less error-prone.

## Verification Steps

1. Create a new user account
2. Navigate to the onboarding process
3. Verify that unclaimed teams are displayed in the team selection dropdown
4. Confirm that claimed teams are not shown
5. Test the team claiming functionality

## Additional Notes

The RLS policy is the authoritative source for determining team availability, as it ensures consistency across all clients and prevents race conditions. The client-side implementation should work with the data as filtered by the database rather than trying to apply its own filtering logic.