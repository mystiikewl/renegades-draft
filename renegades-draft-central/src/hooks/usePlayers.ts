import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Player = Tables<'players'>;

export const usePlayers = (teamId?: string) => {
  return useQuery<Player[]>({
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
};
