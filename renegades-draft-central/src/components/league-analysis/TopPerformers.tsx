import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLeagueAnalysisData } from '@/hooks/useLeagueAnalysisData';
import { TeamStats } from '@/utils/leagueAnalysis';

export const TopPerformers: React.FC = () => {
  const {
    sortedByPoints,
    sortedByRebounds,
    sortedByAssists,
    sortedBySteals,
    sortedByBlocks,
    sortedByThreePointersMade,
    sortedByTurnovers,
    isLoading,
  } = useLeagueAnalysisData();

  const renderTopPlayersTable = (title: string, data: TeamStats[], statKey: keyof TeamStats, isInverseSort = false) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((team, index) => (
                <TableRow key={index}>
                  <TableCell>{team.teamName}</TableCell>
                  <TableCell className="text-right">
                    {typeof team[statKey] === 'number' ? (team[statKey] as number).toFixed(1) : team[statKey]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {renderTopPlayersTable('Points Leaders', sortedByPoints, 'points')}
      {renderTopPlayersTable('Rebounds Leaders', sortedByRebounds, 'rebounds')}
      {renderTopPlayersTable('Assists Leaders', sortedByAssists, 'assists')}
      {renderTopPlayersTable('Steals Leaders', sortedBySteals, 'steals')}
      {renderTopPlayersTable('Blocks Leaders', sortedByBlocks, 'blocks')}
      {renderTopPlayersTable('3PM Leaders', sortedByThreePointersMade, 'three_pointers_made')}
      {renderTopPlayersTable('Turnovers (Lowest is Better)', sortedByTurnovers, 'turnovers', true)}
    </div>
  );
};
