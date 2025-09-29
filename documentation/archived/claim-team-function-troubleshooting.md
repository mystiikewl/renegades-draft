# Troubleshooting claim_team Function Issue

## Problem
Users receive the error: `Failed to claim team: invalid input syntax for type integer: "[UUID]"`

This indicates that the `claim_team` function is expecting an integer parameter but receiving a UUID string.

## Diagnosis Steps

### 1. Check Current Function Definition
Run this SQL query in your Supabase SQL editor:
```sql
SELECT pg_get_functiondef('claim_team'::regproc);
```

This will show the current definition of the function. Look for the parameter types.

### 2. Check Function Parameters
Run this query to see function details:
```sql
SELECT proname, proargnames, proargtypes, proallargtypes
FROM pg_proc
WHERE proname = 'claim_team';
```

### 3. Check for Multiple Versions
```sql
SELECT proname, pronamespace::regnamespace
FROM pg_proc
WHERE proname = 'claim_team';
```

## Solutions

### Solution 1: Drop and Recreate Function
If the function definition is incorrect:

```sql
-- Drop the existing function
DROP FUNCTION IF EXISTS claim_team(uuid);

-- Create the correct function
CREATE OR REPLACE FUNCTION claim_team(target_team_id uuid)
RETURNS json AS $$
DECLARE
  current_user_id uuid := auth.uid();
  user_has_team boolean;
  team_is_claimed boolean;
BEGIN
  -- Check if the user is already on a team
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = current_user_id AND team_id IS NOT NULL) INTO user_has_team;
  IF user_has_team THEN
    RAISE EXCEPTION 'User is already assigned to a team.';
  END IF;

  -- Check if the target team is already claimed by another user
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE team_id = target_team_id) INTO team_is_claimed;
  IF team_is_claimed THEN
    RAISE EXCEPTION 'This team has already been claimed.';
  END IF;

  -- Assign the user to the team
  UPDATE public.profiles
  SET team_id = target_team_id
  WHERE id = current_user_id;

  RETURN json_build_object('status', 'success', 'message', 'Team claimed successfully.');
EXCEPTION
  WHEN others THEN
    RETURN json_build_object('status', 'error', 'message', sqlerrm);
END;
$$ LANGUAGE plpgsql;
```

### Solution 2: Apply Migration Manually
If the migration didn't run properly, you can apply it manually by running the contents of `20250817010000_fix_claim_team_function.sql` in your Supabase SQL editor.

### Solution 3: Check for Type Conflicts
If there are other functions that reference `claim_team` with integer parameters, they may need to be updated as well.

## Verification

After applying a solution, test the function with:
```sql
SELECT claim_team('f2943c99-c52f-412a-9d87-1e4d945ab3ed'::uuid);
```

Replace the UUID with a valid team ID from your database.

## Prevention

1. Always verify that function definitions match the database schema
2. Test functions directly in the database before relying on them in the application
3. Keep migration files in sync with the actual database state
4. Document any manual changes made to the database