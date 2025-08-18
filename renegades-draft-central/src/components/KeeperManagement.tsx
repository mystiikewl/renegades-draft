import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePlayers } from '@/hooks/usePlayers';
import { Tables } from '@/integrations/supabase/types';
import { useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamKeepers } from '@/hooks/useTeamKeepers';
import { KeeperImpactVisualization } from '@/components/KeeperImpactVisualization';
import { useTeams } from '@/hooks/useTeams';
import { useDraftState } from '@/hooks/useDraftState';
import { getCombinedPlayersForTeam, calculateTeamStats } from '@/utils/leagueAnalysis';
import { useIsMobile } from '@/hooks/use-mobile';

interface KeeperManagementProps {
  teamId?: string;
  season?: string;
  onKeepersSelected?: () => void;
}

export const KeeperManagement = ({ teamId: propTeamId, season = "2025-26", onKeepersSelected }: KeeperManagementProps) => {
  const { profile } = useAuth();
  const currentTeamId = propTeamId || profile?.team_id;
  const { data: availablePlayers = [], isLoading: isLoadingPlayers } = usePlayers();
  const { data: keepers = [], isLoading: isLoadingKeepers, refetch: refetchKeepers } = useTeamKeepers({ teamId: currentTeamId || '', season });
  const { data: teamsData = [] } = useTeams();
  const { draftPicks } = useDraftState();
  const [newKeeperPlayerId, setNewKeeperPlayerId] = useState('');
  const [maxKeepers, setMaxKeepers] = useState(9);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const loading = isLoadingPlayers || isLoadingKeepers;

  // Get team stats for visualization
  const currentTeam = teamsData.find(t => t.id === currentTeamId);
  const allPlayersForTeam = currentTeamId ? getCombinedPlayersForTeam(
    currentTeamId, 
    season, 
    draftPicks, 
    keepers
  ) : [];
  
  const teamStats = currentTeam ? calculateTeamStats(currentTeam.id, currentTeam.name, allPlayersForTeam) : undefined;
  
  // Calculate league average
  const leagueStats = teamsData.map(team => {
    const teamPlayers = getCombinedPlayersForTeam(
      team.id, 
      season, 
      draftPicks, 
      keepers
    );
    return calculateTeamStats(team.id, team.name, teamPlayers);
  });
  
  const leagueAverageStats = leagueStats.length > 0 ? {
    ...leagueStats[0],
    totalFantasyScore: leagueStats.reduce((sum, team) => sum + team.totalFantasyScore, 0) / leagueStats.length,
    avgFantasyScore: leagueStats.reduce((sum, team) => sum + team.avgFantasyScore, 0) / leagueStats.length,
    points: leagueStats.reduce((sum, team) => sum + team.points, 0) / leagueStats.length,
    rebounds: leagueStats.reduce((sum, team) => sum + team.rebounds, 0) / leagueStats.length,
    assists: leagueStats.reduce((sum, team) => sum + team.assists, 0) / leagueStats.length,
    steals: leagueStats.reduce((sum, team) => sum + team.steals, 0) / leagueStats.length,
    blocks: leagueStats.reduce((sum, team) => sum + team.blocks, 0) / leagueStats.length,
    turnovers: leagueStats.reduce((sum, team) => sum + team.turnovers, 0) / leagueStats.length,
    three_pointers_made: leagueStats.reduce((sum, team) => sum + team.three_pointers_made, 0) / leagueStats.length,
  } : undefined;

  const addKeeper = async () => {
    if (!newKeeperPlayerId) {
      toast({
        title: "Error",
        description: "Please select a player",
        variant: "destructive"
      });
      return;
    }

    if (keepers.length >= maxKeepers) {
      toast({
        title: "Error",
        description: `Maximum of ${maxKeepers} keepers allowed per team`,
        variant: "destructive"
      });
      return;
    }

    // Check if player is already a keeper
    if (keepers.some(keeper => keeper.id === newKeeperPlayerId)) {
      toast({
        title: "Error",
        description: "This player is already a keeper",
        variant: "destructive"
      });
      return;
    }

    console.log('Attempting to add keeper:', { newKeeperPlayerId, teamId: currentTeamId, season });

    const { error } = await supabase
      .from('keepers')
      .insert({
        player_id: newKeeperPlayerId,
        team_id: currentTeamId,
        season: season
      });

    if (error) {
      console.error('Failed to add keeper:', error);
      console.error('Add keeper error details:', error.message);
      toast({
        title: "Error",
        description: `Failed to add keeper: ${error.message}`,
        variant: "destructive"
      });
    } else {
      // Update player status in the players table
      const { error: playerUpdateError } = await supabase
        .from('players')
        .update({ is_keeper: true, is_drafted: true })
        .eq('id', newKeeperPlayerId);

      if (playerUpdateError) {
        console.error('Failed to update player status after adding keeper:', playerUpdateError);
        toast({
          title: "Error",
          description: `Failed to update player status: ${playerUpdateError.message}`,
          variant: "destructive"
        });
        // Consider rolling back keeper addition if player update fails
      } else {
        toast({
          title: "Success",
          description: "Keeper added successfully"
        });
        setNewKeeperPlayerId('');
        refetchKeepers(); // Refetch keepers using the hook's refetch function
        queryClient.invalidateQueries({ queryKey: ['players'] }); // Invalidate players to update their keeper status if needed elsewhere
        queryClient.invalidateQueries({ queryKey: ['teamKeepers'] }); // Invalidate all keepers query for PlayerPool
        queryClient.invalidateQueries({ queryKey: ['players', undefined] }); // Force re-fetch of all players in usePlayers hook
      }
    }
  };

  const removeKeeper = async (playerId: string) => {
    const { error } = await supabase
      .from('keepers')
      .delete()
      .eq('player_id', playerId)
      .eq('team_id', currentTeamId)
      .eq('season', season);

    if (error) {
      console.error('Failed to remove keeper:', error);
      toast({
        title: "Error",
        description: `Failed to remove keeper: ${error.message}`,
        variant: "destructive"
      });
    } else {
      // Update player status in the players table
      const { error: playerUpdateError } = await supabase
        .from('players')
        .update({ is_keeper: false, is_drafted: false })
        .eq('id', playerId);

      if (playerUpdateError) {
        console.error('Failed to update player status after removing keeper:', playerUpdateError);
        toast({
          title: "Error",
          description: `Failed to update player status: ${playerUpdateError.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Keeper removed successfully"
        });
        refetchKeepers(); // Refetch keepers using the hook's refetch function
        queryClient.invalidateQueries({ queryKey: ['players'] }); // Invalidate players to update their keeper status if needed elsewhere
        queryClient.invalidateQueries({ queryKey: ['teamKeepers'] }); // Invalidate all keepers query for PlayerPool
        queryClient.invalidateQueries({ queryKey: ['players', undefined] }); // Force re-fetch of all players in usePlayers hook
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Keepers</CardTitle>
          <CardDescription>
            Manage your team's keepers for the {season} season ({keepers.length}/{maxKeepers})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-2 w-full">
              <Label htmlFor="keeper-player">Add Keeper</Label>
              <div className="flex flex-col gap-2">
                <select
                  id="keeper-player"
                  value={newKeeperPlayerId}
                  onChange={(e) => setNewKeeperPlayerId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a player</option>
                  {availablePlayers
                    .filter(
                      (player) =>
                        !keepers.some((keeper) => keeper.id === player.id)
                    )
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({player.position}) - {player.nba_team}
                      </option>
                    ))}
                </select>
                <Button 
                  onClick={addKeeper} 
                  disabled={loading || keepers.length >= maxKeepers}
                  className="w-full sm:w-auto"
                >
                  Add Keeper
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading keepers...</div>
          ) : keepers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No keepers set for this team
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead className={isMobile ? "hidden" : ""}>Position</TableHead>
                    <TableHead className={isMobile ? "hidden" : ""}>Team</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keepers.map((keeper) => (
                    <TableRow key={keeper.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{keeper.name}</div>
                          {isMobile && (
                            <div className="text-xs text-muted-foreground">
                              {keeper.position} - {keeper.nba_team}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={isMobile ? "hidden" : ""}>{keeper.position}</TableCell>
                      <TableCell className={isMobile ? "hidden" : ""}>{keeper.nba_team}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size={isMobile ? "sm" : "default"}
                          onClick={() => removeKeeper(keeper.id)}
                        >
                          {isMobile ? "Remove" : "Remove Keeper"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keeper Impact Visualization */}
      <KeeperImpactVisualization 
        keepers={keepers} 
        teamStats={teamStats}
        leagueAverageStats={leagueAverageStats}
      />

      {onKeepersSelected && (
        <Button onClick={onKeepersSelected} className="w-full mt-4">
          Confirm Keepers and Continue
        </Button>
      )}
    </div>
  );
};
