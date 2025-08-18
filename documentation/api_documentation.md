# Renegades Draft API Documentation

This document provides technical documentation for the Renegades Draft application's API interactions with Supabase.

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Real-time Subscriptions](#real-time-subscriptions)
6. [RPC Functions](#rpc-functions)
7. [Error Handling](#error-handling)

## Overview

The Renegades Draft application uses Supabase as its backend, leveraging:
- PostgreSQL database
- Authentication system
- Real-time subscriptions
- RESTful API endpoints
- Remote Procedure Calls (RPC)

## Authentication

The application uses Supabase Auth for user authentication:

### Sign Up
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});
```

### Sign In
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### Sign Out
```javascript
const { error } = await supabase.auth.signOut();
```

## Database Schema

### Tables

#### `players`
Stores NBA player information and statistics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique player identifier |
| name | TEXT | Player full name |
| position | TEXT | Player position(s) |
| nba_team | TEXT | NBA team abbreviation |
| points | REAL | Points per game |
| total_rebounds | REAL | Total rebounds per game |
| assists | REAL | Assists per game |
| steals | REAL | Steals per game |
| blocks | REAL | Blocks per game |
| field_goal_percentage | REAL | Field goal percentage |
| three_point_percentage | REAL | Three-point percentage |
| free_throw_percentage | REAL | Free throw percentage |
| is_drafted | BOOLEAN | Whether player is drafted |
| drafted_by_team_id | UUID | Team that drafted player |
| is_keeper | BOOLEAN | Whether player is a keeper |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

#### `teams`
Stores fantasy team information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique team identifier |
| name | TEXT | Team name |
| owner_id | UUID | User ID of team owner |
| draft_order | INTEGER | Team's draft order position |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

#### `draft_picks`
Stores draft pick information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique pick identifier |
| round | INTEGER | Draft round number |
| pick_number | INTEGER | Pick number within round |
| player_id | UUID | Drafted player ID |
| original_team_id | UUID | Original team owner of pick |
| current_team_id | UUID | Current team owner of pick |
| is_used | BOOLEAN | Whether pick has been used |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

#### `draft_settings`
Stores league draft settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique settings identifier |
| roster_size | INTEGER | Number of rounds in draft |
| league_size | INTEGER | Number of teams in league |
| season | TEXT | Season identifier (e.g., "2025-26") |
| draft_type | TEXT | Draft type ("snake", "linear", "manual") |
| pick_time_limit_seconds | INTEGER | Time limit per pick in seconds |
| draft_order | JSONB | Array of team IDs in draft order |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

#### `profiles`
Stores user profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique user identifier |
| email | TEXT | User email address |
| team_id | UUID | Team assigned to user |
| is_admin | BOOLEAN | Whether user has admin privileges |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

#### `keepers`
Stores keeper player information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique keeper identifier |
| player_id | UUID | Keeper player ID |
| team_id | UUID | Team that owns the keeper |
| draft_pick_cost | INTEGER | Draft pick round cost |
| season | TEXT | Season for which player is kept |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

## API Endpoints

### Players

#### Get All Players
```javascript
const { data, error } = await supabase
  .from('players')
  .select('*')
  .order('fantasy_points', { ascending: false });
```

#### Get Available Players
```javascript
const { data, error } = await supabase
  .from('players')
  .select('*')
  .is('is_drafted', false)
  .order('fantasy_points', { ascending: false });
```

#### Update Player as Drafted
```javascript
const { data, error } = await supabase
  .from('players')
  .update({ 
    is_drafted: true, 
    drafted_by_team_id: teamId 
  })
  .eq('id', playerId);
```

### Teams

#### Get All Teams
```javascript
const { data, error } = await supabase
  .from('teams')
  .select('*')
  .order('draft_order', { ascending: true });
```

#### Create Team
```javascript
const { data, error } = await supabase
  .from('teams')
  .insert([{ 
    name: teamName, 
    owner_id: ownerId,
    draft_order: draftOrder 
  }]);
```

#### Update Team
```javascript
const { data, error } = await supabase
  .from('teams')
  .update({ name: newName, owner_id: newOwnerId })
  .eq('id', teamId);
```

#### Delete Team
```javascript
const { data, error } = await supabase
  .from('teams')
  .delete()
  .eq('id', teamId);
```

### Draft Picks

#### Get Draft Picks
```javascript
const { data, error } = await supabase
  .from('draft_picks')
  .select(`
    *,
    player:players(*),
    original_team:teams(*),
    current_team:teams(*)
  `)
  .order('round', { ascending: true })
  .order('pick_number', { ascending: true });
```

#### Create Draft Pick
```javascript
const { data, error } = await supabase
  .from('draft_picks')
  .insert([{ 
    round: roundNumber,
    pick_number: pickNumber,
    original_team_id: originalTeamId,
    current_team_id: currentTeamId
  }]);
```

#### Update Draft Pick (Make Selection)
```javascript
const { data, error } = await supabase
  .from('draft_picks')
  .update({ 
    player_id: playerId,
    is_used: true
  })
  .eq('id', pickId);
```

### Draft Settings

#### Get Draft Settings
```javascript
const { data, error } = await supabase
  .from('draft_settings')
  .select('*')
  .single();
```

#### Update Draft Settings
```javascript
const { data, error } = await supabase
  .from('draft_settings')
  .update({
    roster_size: rosterSize,
    league_size: leagueSize,
    season: season,
    draft_type: draftType,
    pick_time_limit_seconds: timeLimit,
    draft_order: draftOrder
  })
  .eq('id', settingsId);
```

### Profiles

#### Get User Profile
```javascript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

#### Update User Profile
```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ team_id: teamId, is_admin: isAdmin })
  .eq('id', userId);
```

## Real-time Subscriptions

### Draft Picks Subscription
```javascript
const subscription = supabase
  .channel('draft_picks_changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'draft_picks' },
    (payload) => {
      // Handle draft pick changes
      console.log('Draft pick updated:', payload);
    }
  )
  .subscribe();
```

### Draft Settings Subscription
```javascript
const subscription = supabase
  .channel('draft_settings_changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'draft_settings' }, 
    (payload) => {
      // Handle draft settings changes
      console.log('Draft settings updated:', payload);
    }
  )
  .subscribe();
```

### Teams Subscription
```javascript
const subscription = supabase
  .channel('teams_changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'teams' },
    (payload) => {
      // Handle team changes
      console.log('Team updated:', payload);
    }
  )
  .subscribe();
```

## RPC Functions

### Assign Team Owner
```javascript
const { data, error } = await supabase.rpc('assign_team_owner', {
  p_user_id: userId,
  p_team_id: teamId
});
```

### Unassign Team Owner
```javascript
const { data, error } = await supabase.rpc('unassign_team_owner', {
  p_user_id: userId
});
```

### Claim Team
```javascript
const { data, error } = await supabase.rpc('claim_team', {
  p_user_id: userId,
  p_team_id: teamId
});
```

## Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| PGRST116 | Row not found | Check if record exists |
| 23505 | Duplicate key | Ensure unique values |
| 23503 | Foreign key violation | Check referenced records |
| 42501 | Insufficient privileges | Verify user permissions |

### Error Response Format
```javascript
{
  error: {
    code: "PGRST116",
    details: null,
    hint: null,
    message: "The result contains 0 rows"
  }
}
```

### Handling Errors in Code
```javascript
const { data, error } = await supabase.from('players').select('*');

if (error) {
  console.error('Error fetching players:', error.message);
  // Handle error appropriately
  // Show user-friendly message
  // Log error for debugging
} else {
  // Process data
  setPlayers(data);
}
```

## Best Practices

### Data Consistency
1. Always fetch related data using joins when possible
2. Use transactions for multi-step operations
3. Implement proper error handling for all database operations

### Performance Optimization
1. Use indexes on frequently queried columns
2. Limit result sets when possible
3. Use pagination for large datasets
4. Implement proper caching strategies

### Security
1. Use Row Level Security (RLS) policies
2. Validate all user inputs
3. Implement proper authentication checks
4. Use parameterized queries to prevent SQL injection

### Real-time Considerations
1. Unsubscribe from channels when components unmount
2. Handle reconnection scenarios
3. Implement proper state synchronization
4. Use selective subscriptions to minimize bandwidth