import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Player = Tables<'players'>;

export const useRealTimePlayers = (teamId?: string) => {
  const queryClient = useQueryClient();
  
  const queryResult = useQuery<Player[]>({
    queryKey: ['players', teamId],
    queryFn: async () => {
      let query = supabase.from('players').select('*, is_keeper, keeper_team_id, is_rookie');

      if (teamId) {
        query = query.or(`drafted_by_team_id.eq.${teamId},keeper_team_id.eq.${teamId}`);
      }
      // When no teamId is provided, fetch all players. Filtering for keepers will be done in the component.

      const { data, error } = await query.order('rank', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // Set up real-time subscription for players table
    const channel = supabase
      .channel('players-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
        },
        (payload) => {
          // When a player is updated, invalidate the players query to refetch the data
          queryClient.invalidateQueries({ queryKey: ['players', teamId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
        },
        (payload) => {
          // When a new player is inserted, invalidate the players query to refetch the data
          queryClient.invalidateQueries({ queryKey: ['players', teamId] });
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, teamId]);

  return queryResult;
};