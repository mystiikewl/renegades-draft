import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type DraftPickWithRelations = Tables<'draft_picks'> & {
  player: Tables<'players'> | null;
  original_team: Tables<'teams'>;
  current_team: Tables<'teams'>;
};

export const useRealTimeDraftPicks = () => {
  const [draftPicks, setDraftPicks] = useState<DraftPickWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchDraftPicks = async () => {
      const { data, error } = await supabase
        .from('draft_picks')
        .select(`
          *,
          player:players(*),
          original_team:teams!draft_picks_original_team_id_fkey(*),
          current_team:teams!draft_picks_current_team_id_fkey(*)
        `)
        .order('round', { ascending: true })
        .order('pick_number', { ascending: true });
      
      if (error) {
        console.error('Error fetching draft picks:', error);
      } else {
        setDraftPicks(data as DraftPickWithRelations[]);
      }
      setLoading(false);
    };

    fetchDraftPicks();

    // Set up real-time subscription
    const channel = supabase
      .channel('draft_picks_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'draft_picks',
        },
        (payload) => {
          // Handle INSERT events if needed
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'draft_picks',
        },
        (payload) => {
          // When a pick is updated, re-fetch the full pick with its relations
          const fetchUpdatedPick = async () => {
            const { data, error } = await supabase
              .from('draft_picks')
              .select(`
                *,
                player:players(*),
                original_team:teams!draft_picks_original_team_id_fkey(*),
                current_team:teams!draft_picks_current_team_id_fkey(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching updated draft pick:', error);
            } else if (data) {
              setDraftPicks((prev) =>
                prev.map((pick) =>
                  pick.id === data.id ? data as DraftPickWithRelations : pick
                )
              );
            }
          };
          fetchUpdatedPick();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'draft_picks',
        },
        (payload) => {
          // Handle DELETE events if needed
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { draftPicks, loading };
};
