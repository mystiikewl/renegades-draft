import { useQuery } from '@tanstack/react-query';
import { fetchKeepersByTeam, fetchKeepers, Keeper } from '@/integrations/supabase/services/keepers';
import { Tables } from '@/integrations/supabase/types';

interface UseTeamKeepersProps {
  teamId?: string; // Make teamId optional
  season: string;
}

export const useTeamKeepers = ({ teamId, season }: UseTeamKeepersProps) => {
  return useQuery<Keeper[]>({
    queryKey: ['teamKeepers', teamId || 'all', season],
    queryFn: async () => {
      if (teamId) {
        // Existing logic for fetching keepers for a specific team
        const keepers = await fetchKeepersByTeam(teamId);
        return keepers.filter(keeper => keeper.season === season);
      } else {
        // Modified logic to always fetch all keepers regardless of user role
        const keepers = await fetchKeepers();
        return keepers.filter(keeper => keeper.season === season);
      }
    },
    enabled: !!season,
  });
};
