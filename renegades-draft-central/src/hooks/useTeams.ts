import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types/team'; // Import the new Team type

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
