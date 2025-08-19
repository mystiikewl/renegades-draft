import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Target, Trophy, Users, Zap, Shield, Dribbble, Swords, Scale } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { calculateFantasyScore } from '@/utils/fantasyScore';
import { TeamStats } from '@/utils/leagueAnalysis';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define a type for player positions
type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

// Extend Tables<'keepers'> to include the nested player object
type KeeperPlayer = Tables<'keepers'> & { player: Tables<'players'> };

interface TeamStrengthsWeaknessesProps {
  players: (Tables<'players'> | KeeperPlayer)[];
  teamStats?: TeamStats;
  leagueAverageStats?: TeamStats;
}

// Helper to determine positional needs
const getPositionalNeeds = (players: (Tables<'players'> | KeeperPlayer)[]) => {
  const positionCounts = players.reduce((acc, p) => {
    const position = ('player' in p ? p.player.position : p.position) as Position;
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {} as Record<Position, number>);

  const needs: string[] = [];
  if ((positionCounts['PG'] || 0) < 2) needs.push('Point Guard (PG)');
  if ((positionCounts['SG'] || 0) < 2) needs.push('Shooting Guard (SG)');
  if ((positionCounts['SF'] || 0) < 2) needs.push('Small Forward (SF)');
  if ((positionCounts['PF'] || 0) < 2) needs.push('Power Forward (PF)');
  if ((positionCounts['C'] || 0) < 1) needs.push('Center (C)');

  return needs;
};

// Helper to identify strengths and weaknesses based on league average
const getStrengthsAndWeaknesses = (teamStats: TeamStats, leagueAverageStats: TeamStats) => {
  const categories = [
    { key: 'points', name: 'Points', icon: <Zap className="h-4 w-4" /> },
    { key: 'rebounds', name: 'Rebounds', icon: <Shield className="h-4 w-4" /> },
    { key: 'assists', name: 'Assists', icon: <Dribbble className="h-4 w-4" /> },
    { key: 'steals', name: 'Steals', icon: <Swords className="h-4 w-4" /> },
    { key: 'blocks', name: 'Blocks', icon: <Scale className="h-4 w-4" /> },
    { key: 'three_pointers_made', name: '3 Pointers Made', icon: <Target className="h-4 w-4" /> },
    { key: 'turnovers', name: 'Turnovers', isInverse: true, icon: <Users className="h-4 w-4" /> }, // Inverse metric
  ];

  const comparativeStats = categories.map(cat => {
    const teamValue = teamStats[cat.key as keyof TeamStats] as number;
    const leagueValue = leagueAverageStats[cat.key as keyof TeamStats] as number;
    const difference = cat.isInverse ? leagueValue - teamValue : teamValue - leagueValue; // For turnovers, higher league avg - team value is better

    return {
      ...cat,
      teamValue,
      leagueValue,
      difference,
      isStrength: difference > 0,
    };
  });

  const strengths = comparativeStats
    .filter(s => s.isStrength)
    .sort((a, b) => b.difference - a.difference)
    .slice(0, 3);

  const weaknesses = comparativeStats
    .filter(s => !s.isStrength)
    .sort((a, b) => a.difference - b.difference)
    .slice(0, 3);

  return { strengths, weaknesses };
};

export const TeamStrengthsWeaknesses = ({ 
  players, 
  teamStats,
  leagueAverageStats 
}: TeamStrengthsWeaknessesProps) => {
  const positionalNeeds = getPositionalNeeds(players);
  const { strengths, weaknesses } = teamStats && leagueAverageStats 
    ? getStrengthsAndWeaknesses(teamStats, leagueAverageStats) 
    : { strengths: [], weaknesses: [] };

  const totalTeamScore = players.reduce((sum, p) => {
    const playerData = 'player' in p ? p.player : p;
    return sum + calculateFantasyScore(playerData);
  }, 0);

  const averagePlayerScore = players.length > 0 ? totalTeamScore / players.length : 0;

  return (
    <div className="space-y-6">
      {/* Team Overview Card */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Team Overview & Summary
          </CardTitle>
          <CardDescription>
            A comprehensive look at your team's composition and performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Total Roster Score</div>
              <div className="text-2xl font-bold">{totalTeamScore.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-1">Combined fantasy points from all players</div>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Average Player Score</div>
              <div className="text-2xl font-bold">{averagePlayerScore.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-1">Per player contribution</div>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Roster Size</div>
              <div className="text-2xl font-bold">{players.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total players on your team</div>
            </div>
          </div>

          {players.length > 0 && (
            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Top Fantasy Contributors</div>
              <div className="space-y-2">
                {players
                  .sort((a, b) => calculateFantasyScore('player' in b ? b.player : b) - calculateFantasyScore('player' in a ? a.player : a))
                  .slice(0, 3)
                  .map((p, index) => {
                    const player = 'player' in p ? p.player : p;
                    return (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-background/30 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{calculateFantasyScore(player).toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Strengths & Weaknesses */}
      {teamStats && leagueAverageStats && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Strengths & Weaknesses
            </CardTitle>
            <CardDescription>
              Key areas where your team excels or needs improvement compared to the league average.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold mb-2">Strengths</h4>
              {strengths.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {strengths.map(s => (
                    <TooltipProvider key={s.key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="default" className="text-sm bg-green-500 hover:bg-green-600">
                            {s.icon} {s.name} (+{Math.abs(s.difference).toFixed(1)})
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your team: {s.teamValue.toFixed(1)}</p>
                          <p>League Avg: {s.leagueValue.toFixed(1)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No clear strengths identified yet.</p>
              )}
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Weaknesses</h4>
              {weaknesses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {weaknesses.map(w => (
                    <TooltipProvider key={w.key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="destructive" className="text-sm">
                            {w.icon} {w.name} ({w.isInverse ? '+' : ''}{Math.abs(w.difference).toFixed(1)})
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your team: {w.teamValue.toFixed(1)}</p>
                          <p>League Avg: {w.leagueValue.toFixed(1)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No clear weaknesses identified yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Positional Needs */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Positional Needs
          </CardTitle>
          <CardDescription>
            Identify positions where your team might need more depth or talent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positionalNeeds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {positionalNeeds.map((need) => (
                <Badge key={need} variant="outline" className="text-sm border-dashed">
                  {need}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Your roster appears to have good positional balance.</p>
          )}
        </CardContent>
      </Card>

      {/* Strategic Summary */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Strategic Summary
          </CardTitle>
          <CardDescription>
            Overall insights and recommendations for your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {teamStats && leagueAverageStats ? (
              <>
                Your team currently ranks{' '}
                <span className="font-semibold">
                  {teamStats.totalFantasyScore > leagueAverageStats.totalFantasyScore ? 'above' : 'below'}
                </span>{' '}
                the league average in total fantasy score.
                {strengths.length > 0 && ` You excel in ${strengths.map(s => s.name).join(', ')}.`}
                {weaknesses.length > 0 && ` Consider targeting players who can improve your ${weaknesses.map(w => w.name).join(', ')} categories.`}
                {positionalNeeds.length > 0 && ` You also have positional needs at ${positionalNeeds.join(', ')}.`}
              </>
            ) : (
              "Analyze your team's strengths and weaknesses to optimize your draft strategy."
            )}
          </p>
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">Pro Tip:</span> Use these insights to guide your draft picks,
              filling positional gaps and shoring up statistical weaknesses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
