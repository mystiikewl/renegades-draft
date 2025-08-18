import { Tables } from '@/integrations/supabase/types';
import { calculateFantasyScore } from '@/utils/fantasyScore';

type KeeperPlayer = Tables<'keepers'> & { player: Tables<'players'> };

// Helper to combine drafted players and keepers for a team
export const getCombinedPlayersForTeam = (
  teamId: string,
  season: string,
  draftPicks: (Tables<'draft_picks'> & { player: Tables<'players'> | null; original_team: Tables<'teams'>; current_team: Tables<'teams'>; })[],
  keepersData: KeeperPlayer[]
) => {
  const teamDraftPicks = draftPicks.filter(pick => pick.current_team_id === teamId && pick.player);

  const mappedDraftedPlayers = teamDraftPicks.map(pick => ({
    ...pick.player!,
    round: pick.round,
    pick: pick.pick_number,
    overallPick: draftPicks.findIndex(dp => dp.id === pick.id) + 1,
    nbaTeam: pick.player!.nba_team,
  })) as (Tables<'players'> & { round: number; pick: number; overallPick: number; nbaTeam: string; })[];

  // For keepers, we need to check if the player object has a team_id property
  // The keepersData might be structured differently depending on how it's fetched
  const teamKeepers = keepersData.filter(k => {
    // If k has a team_id property, use that
    if ('team_id' in k) {
      return k.team_id === teamId;
    }
    // If k is a player object with a keeper_team_id property, use that
    if ('keeper_team_id' in k) {
      return k.keeper_team_id === teamId;
    }
    // If neither, we can't filter by team
    return false;
  });

  const allPlayers: (Tables<'players'> | KeeperPlayer)[] = [
    ...teamKeepers,
    ...mappedDraftedPlayers,
  ];
  
  return allPlayers;
};

// Helper to calculate team stats
export interface TeamStats {
  teamId: string;
  teamName: string;
  totalFantasyScore: number;
  avgFantasyScore: number;
  playerCount: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  three_pointers_made: number;
}

export const calculateTeamStats = (teamId: string, teamName: string, players: (Tables<'players'> | KeeperPlayer)[]): TeamStats => {
  let totalFantasyScore = 0;
  let totalPoints = 0;
  let totalRebounds = 0;
  let totalAssists = 0;
  let totalSteals = 0;
  let totalBlocks = 0;
  let totalTurnovers = 0;
  let totalThreePointersMade = 0;

  players.forEach(p => {
    const playerData = 'player' in p ? p.player : p;
    totalFantasyScore += calculateFantasyScore(playerData);
    totalPoints += playerData.points || 0;
    totalRebounds += playerData.total_rebounds || 0;
    totalAssists += playerData.assists || 0;
    totalSteals += playerData.steals || 0;
    totalBlocks += playerData.blocks || 0;
    totalTurnovers += playerData.turnovers || 0;
    totalThreePointersMade += playerData.three_pointers_made || 0;
  });

  return {
    teamId,
    teamName,
    totalFantasyScore: parseFloat(totalFantasyScore.toFixed(2)),
    avgFantasyScore: players.length > 0 ? parseFloat((totalFantasyScore / players.length).toFixed(2)) : 0,
    playerCount: players.length,
    points: totalPoints,
    rebounds: totalRebounds,
    assists: totalAssists,
    steals: totalSteals,
    blocks: totalBlocks,
    turnovers: totalTurnovers,
    three_pointers_made: totalThreePointersMade,
  };
};

export const prepareRadarChartData = (
  selectedTeamForRadar: string,
  allTeamStats: TeamStats[],
  selectedTeamName: string
) => {
  if (!selectedTeamForRadar || allTeamStats.length === 0) return [];

  const selectedTeamStats = allTeamStats.find(ts => ts.teamId === selectedTeamForRadar);
  if (!selectedTeamStats) return [];

  // Calculate max values for normalization
  const maxPoints = Math.max(...allTeamStats.map(s => s.points));
  const maxRebounds = Math.max(...allTeamStats.map(s => s.rebounds));
  const maxAssists = Math.max(...allTeamStats.map(s => s.assists));
  const maxSteals = Math.max(...allTeamStats.map(s => s.steals));
  const maxBlocks = Math.max(...allTeamStats.map(s => s.blocks));
  const maxThreePointersMade = Math.max(...allTeamStats.map(s => s.three_pointers_made));
  const minTurnovers = Math.min(...allTeamStats.map(s => s.turnovers)); // For turnovers, lower is better
  const maxTurnovers = Math.max(...allTeamStats.map(s => s.turnovers)); // Also need max for inverse normalization

  // Calculate league averages
  const leagueAvg = allTeamStats.reduce((acc, curr) => {
    acc.points += curr.points;
    acc.rebounds += curr.rebounds;
    acc.assists += curr.assists;
    acc.steals += curr.steals;
    acc.blocks += curr.blocks;
    acc.turnovers += curr.turnovers;
    acc.three_pointers_made += curr.three_pointers_made;
    return acc;
  }, {
    points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, three_pointers_made: 0
  });

  const numTeams = allTeamStats.length;
  const avgPoints = leagueAvg.points / numTeams;
  const avgRebounds = leagueAvg.rebounds / numTeams;
  const avgAssists = leagueAvg.assists / numTeams;
  const avgSteals = leagueAvg.steals / numTeams;
  const avgBlocks = leagueAvg.blocks / numTeams;
  const avgTurnovers = leagueAvg.turnovers / numTeams;
  const avgThreePointersMade = leagueAvg.three_pointers_made / numTeams;

  // Normalize data for radar chart (0-100 scale)
  const normalize = (value: number, max: number, isInverse = false) => {
    if (max === 0) return 50; // Avoid division by zero, set to mid-point
    if (isInverse) {
      // For inverse metrics (like turnovers), higher value means worse, so normalize inversely
      return 100 - ((value - minTurnovers) / (maxTurnovers - minTurnovers)) * 100;
    }
    return (value / max) * 100;
  };

  return [
    {
      subject: 'Points',
      [selectedTeamName]: normalize(selectedTeamStats.points, maxPoints),
      'League Average': normalize(avgPoints, maxPoints),
      fullMark: 100,
    },
    {
      subject: 'Rebounds',
      [selectedTeamName]: normalize(selectedTeamStats.rebounds, maxRebounds),
      'League Average': normalize(avgRebounds, maxRebounds),
      fullMark: 100,
    },
    {
      subject: 'Assists',
      [selectedTeamName]: normalize(selectedTeamStats.assists, maxAssists),
      'League Average': normalize(avgAssists, maxAssists),
      fullMark: 100,
    },
    {
      subject: 'Steals',
      [selectedTeamName]: normalize(selectedTeamStats.steals, maxSteals),
      'League Average': normalize(avgSteals, maxSteals),
      fullMark: 100,
    },
    {
      subject: 'Blocks',
      [selectedTeamName]: normalize(selectedTeamStats.blocks, maxBlocks),
      'League Average': normalize(avgBlocks, maxBlocks),
      fullMark: 100,
    },
    {
      subject: '3PM',
      [selectedTeamName]: normalize(selectedTeamStats.three_pointers_made, maxThreePointersMade),
      'League Average': normalize(avgThreePointersMade, maxThreePointersMade),
      fullMark: 100,
    },
    {
      subject: 'Turnovers',
      [selectedTeamName]: normalize(selectedTeamStats.turnovers, maxTurnovers, true), // Inverse normalization
      'League Average': normalize(avgTurnovers, maxTurnovers, true),
      fullMark: 100,
    },
  ];
};
