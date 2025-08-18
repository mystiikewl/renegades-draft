import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface UseTeamKeepersProps {
  teamId?: string; // Make teamId optional
  season: string;
}

export const useTeamKeepers = ({ teamId, season }: UseTeamKeepersProps) => {
  return useQuery<Tables<'players'>[]>({
    queryKey: ['teamKeepers', teamId || 'all', season],
    queryFn: async () => {
      if (teamId) {
        // Existing logic for fetching keepers for a specific team
        const { data, error } = await supabase
          .from('keepers')
          .select('*, players(*)')
          .eq('team_id', teamId)
          .eq('season', season);

        if (error) {
          console.error('Error fetching team keepers:', error);
          throw error;
        }
        return data.map(keeper => keeper.players as Tables<'players'>);
      } else {
        // Modified logic to always fetch all keepers regardless of user role
        const { data, error } = await supabase
          .from('keepers')
          .select('*, players(*)')
          .eq('season', season);

        if (error) {
          console.error('Error fetching all keepers:', error);
          throw error;
        }
        return data.map(keeper => keeper.players as Tables<'players'>);
      }
    },
    enabled: !!season,
  });
};
