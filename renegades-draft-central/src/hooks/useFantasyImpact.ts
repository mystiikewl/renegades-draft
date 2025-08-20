import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { calculateFantasyImpact, FantasyImpactResult, TeamStats } from '@/utils/fantasyImpactCalculator';

type DraftPick = {
  player_id: string | null;
  season: string;
  current_team_id: string;
};

type Player = Tables<'players'>;

interface UseFantasyImpactProps {
  player: Tables<'players'> | null;
  teamId: string;
  season: string;
}

interface LeagueTeamStats {
  id: string;
  name: string;
  stats: TeamStats;
}

/**
 * Custom hook to calculate fantasy impact of adding a player to a team
 */
export const useFantasyImpact = ({ player, teamId, season }: UseFantasyImpactProps) => {
  // Fetch current team stats
  const { data: currentTeamStats, isLoading: isLoadingTeamStats } = useQuery({
    queryKey: ['teamStats', teamId, season],
    queryFn: async (): Promise<TeamStats> => {
      // First get draft picks
      const { data: picksData, error: picksError } = await supabase
        .from('draft_picks')
        .select('player_id')
        .eq('current_team_id', teamId)
        .eq('season', season) as { data: { player_id: string | null }[] | null; error: any };

      if (picksError) throw picksError;

      // Get player details
      const playerIds = picksData?.map(pick => pick.player_id).filter(Boolean) || [];
      if (playerIds.length === 0) {
        return {
          points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
          three_pointers_made: 0, field_goal_percentage: 0, free_throw_percentage: 0,
          turnovers: 0, games_played: 0, playerCount: 0
        };
      }

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .in('id', playerIds);

      if (playersError) throw playersError;

      // Calculate current team stats from drafted players and keepers
      return calculateTeamStats(playersData || []);
    },
    enabled: !!teamId && !!season,
  });

  // Fetch league standings for comparison
  const { data: leagueStats, isLoading: isLoadingLeague } = useQuery({
    queryKey: ['leagueStats', season],
    queryFn: async () => {
      // Get all teams and their current rosters
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*');

      if (teamsError) throw teamsError;

      const leagueStats: LeagueTeamStats[] = [];

      for (const team of teams) {
        const { data: teamPicks, error: picksError } = await supabase
          .from('draft_picks')
          .select(`
            *,
            player:players(*)
          `)
          .eq('current_team_id', team.id)
          .eq('season', season);

        if (picksError) continue;

        const teamPlayers = teamPicks
          .filter(pick => pick.player)
          .map(pick => pick.player!);

        const teamStats = calculateTeamStats(teamPlayers);

        leagueStats.push({
          id: team.id,
          name: team.name,
          stats: teamStats,
        });
      }

      return leagueStats;
    },
    enabled: !!season,
  });

  // Calculate current team overall rank
  const currentOverallRank = useMemo(() => {
    if (!currentTeamStats || !leagueStats) return 0;

    const fantasyScores = leagueStats.map(team => calculateFantasyScore(team.stats));
    const currentScore = calculateFantasyScore(currentTeamStats);

    const sortedScores = [...fantasyScores, currentScore].sort((a, b) => b - a);
    return sortedScores.findIndex(score => score === currentScore) + 1;
  }, [currentTeamStats, leagueStats]);

  // Calculate fantasy impact
  const fantasyImpact = useMemo((): FantasyImpactResult | null => {
    if (!player || !currentTeamStats || !leagueStats) return null;

    try {
      const leagueStatsArray = leagueStats.map(team => team.stats);
      return calculateFantasyImpact(player, currentTeamStats, leagueStatsArray, currentOverallRank);
    } catch (error) {
      console.error('Error calculating fantasy impact:', error);
      return null;
    }
  }, [player, currentTeamStats, leagueStats, currentOverallRank]);

  const isLoading = isLoadingTeamStats || isLoadingLeague;

  return {
    fantasyImpact,
    currentTeamStats,
    leagueStats,
    isLoading,
    error: null, // Add proper error handling if needed
  };
};

/**
 * Calculate team stats from array of players
 */
function calculateTeamStats(players: Tables<'players'>[]): TeamStats {
  const gamesPlayed = Math.max(1, players.reduce((sum, p) => sum + (p.games_played || 0), 0) / Math.max(1, players.length));

  return {
    points: players.reduce((sum, p) => sum + (p.points || 0), 0),
    rebounds: players.reduce((sum, p) => sum + (p.total_rebounds || 0), 0),
    assists: players.reduce((sum, p) => sum + (p.assists || 0), 0),
    steals: players.reduce((sum, p) => sum + (p.steals || 0), 0),
    blocks: players.reduce((sum, p) => sum + (p.blocks || 0), 0),
    three_pointers_made: players.reduce((sum, p) => sum + (p.three_pointers_made || 0), 0),
    field_goal_percentage: calculateAveragePercentage(players.map(p => p.field_goal_percentage)),
    free_throw_percentage: calculateAveragePercentage(players.map(p => p.free_throw_percentage)),
    turnovers: players.reduce((sum, p) => sum + (p.turnovers || 0), 0),
    games_played: gamesPlayed,
    playerCount: players.length,
  };
}

/**
 * Calculate average percentage from array of percentages
 */
function calculateAveragePercentage(percentages: (number | null)[]): number {
  const validPercentages = percentages.filter(p => p !== null && !isNaN(p)) as number[];
  if (validPercentages.length === 0) return 0;

  return validPercentages.reduce((sum, p) => sum + p, 0) / validPercentages.length;
}

/**
 * Calculate fantasy score from team stats (simplified version)
 */
function calculateFantasyScore(teamStats: TeamStats): number {
  const FANTASY_WEIGHTS = {
    points: 1.0,
    rebounds: 1.2,
    assists: 1.5,
    steals: 2.0,
    blocks: 2.0,
    turnovers: -1.0,
    three_pointers_made: 0.5,
  };

  // Calculate per-game averages
  const gamesPlayed = teamStats.games_played || 1;
  const ppg = teamStats.points / gamesPlayed;
  const rpg = teamStats.rebounds / gamesPlayed;
  const apg = teamStats.assists / gamesPlayed;
  const spg = teamStats.steals / gamesPlayed;
  const bpg = teamStats.blocks / gamesPlayed;
  const tpg = teamStats.turnovers / gamesPlayed;
  const tpm = teamStats.three_pointers_made / gamesPlayed;

  return (
    ppg * FANTASY_WEIGHTS.points +
    rpg * FANTASY_WEIGHTS.rebounds +
    apg * FANTASY_WEIGHTS.assists +
    spg * FANTASY_WEIGHTS.steals +
    bpg * FANTASY_WEIGHTS.blocks +
    tpg * FANTASY_WEIGHTS.turnovers +
    tpm * FANTASY_WEIGHTS.three_pointers_made
  );
}