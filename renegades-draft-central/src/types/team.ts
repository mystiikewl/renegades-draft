import { Tables } from '@/integrations/supabase/types';

export type Team = Tables<'teams'> & { profiles: Tables<'profiles'>[] | null };
