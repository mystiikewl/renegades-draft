import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';
import { KeeperPlayer } from '@/hooks/useTeamKeepers';
import { calculateFantasyScore } from '@/utils/fantasyScore'; // Will create this utility

interface TeamRosterAnalysisProps {
  players: (Tables<'players'> | KeeperPlayer)[];
}

export function TeamRosterAnalysis({ players }: TeamRosterAnalysisProps) {
  // Group players by position
  const positionCounts = players.reduce((acc, player) => {
    const position = 'player' in player ? player.player.position : player.position;
    acc[position] = (acc[position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total and average fantasy score
  const totalFantasyScore = players.reduce((sum, player) => {
    const playerData = 'player' in player ? player.player : player;
    return sum + calculateFantasyScore(playerData);
  }, 0);

  const averageFantasyScore = players.length > 0 ? totalFantasyScore / players.length : 0;

  // Determine positional needs (example logic, can be refined)
  const positionalNeeds: string[] = [];
  if ((positionCounts['PG'] || 0) < 2) positionalNeeds.push('Point Guard');
  if ((positionCounts['SG'] || 0) < 2) positionalNeeds.push('Shooting Guard');
  if ((positionCounts['SF'] || 0) < 2) positionalNeeds.push('Small Forward');
  if ((positionCounts['PF'] || 0) < 2) positionalNeeds.push('Power Forward');
  if ((positionCounts['C'] || 0) < 1) positionalNeeds.push('Center');

  return (
    <Card className="p-4 md:p-6 bg-gradient-card shadow-card mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Roster Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Analysis */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Position Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(positionCounts).map(([position, count]) => (
              <Badge key={position} variant="outline" className="text-sm">
                {position}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Team Strength Indicators */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Team Strength</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Total Fantasy Score</p>
              <p className="text-xl font-bold">{totalFantasyScore.toFixed(2)}</p>
            </div>
            <div className="p-3 border rounded-lg bg-background">
              <p className="text-sm text-muted-foreground">Average Player Score</p>
              <p className="text-xl font-bold">{averageFantasyScore.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Positional Needs Assessment */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Positional Needs</h4>
          {positionalNeeds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {positionalNeeds.map((need) => (
                <Badge key={need} variant="destructive" className="text-sm">
                  {need}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Roster looks balanced!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
