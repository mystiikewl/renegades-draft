import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type DraftPick = Tables<'draft_picks'> & {
  player: Tables<'players'> | null;
  original_team: Tables<'teams'>;
  current_team: Tables<'teams'>;
  overall_pick: number;
};

export const useDraftPicks = () => {
  return useQuery<DraftPick[]>({
    queryKey: ['draftPicks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('draft_picks')
        .select(`
          *,
          overall_pick,
          player:players(*),
          original_team:teams!draft_picks_original_team_id_fkey(*),
          current_team:teams!draft_picks_current_team_id_fkey(*)
        `)
        .order('round', { ascending: true })
        .order('pick_number', { ascending: true });
      
      if (error) throw error;
      return data as DraftPick[];
    },
  });
};
