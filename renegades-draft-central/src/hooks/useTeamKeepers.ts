import { useQuery } from '@tanstack/react-query';
import { fetchKeepersByTeam, fetchKeepers } from '@/integrations/supabase/services/keepers';
import { Tables } from '@/integrations/supabase/types';

interface UseTeamKeepersProps {
  teamId?: string; // Make teamId optional
  season: string;
}

export const useTeamKeepers = ({ teamId, season }: UseTeamKeepersProps) => {
  return useQuery<(Tables<'keepers'> & { player: Tables<'players'> })[]>({
    queryKey: ['teamKeepers', teamId || 'all', season],
    queryFn: async () => {
      const keepers = teamId ? await fetchKeepersByTeam(teamId) : await fetchKeepers();
      return keepers
        .filter(keeper => keeper.season === season && keeper.player)
        .map(keeper => ({
          ...keeper,
          player: keeper.player as Tables<'players'>,
        }));
    },
    enabled: !!season,
  });
};
