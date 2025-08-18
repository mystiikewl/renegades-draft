import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Target, Trophy, Users } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { calculateFantasyScore } from '@/utils/fantasyScore';
import { TeamStats } from '@/utils/leagueAnalysis';

interface KeeperImpactVisualizationProps {
  keepers: Tables<'players'>[];
  teamStats?: TeamStats;
  leagueAverageStats?: TeamStats;
}

export const KeeperImpactVisualization = ({ 
  keepers, 
  teamStats,
  leagueAverageStats 
}: KeeperImpactVisualizationProps) => {
  // Calculate total keeper contribution
  const totalKeeperScore = keepers.reduce((sum, player) => {
    return sum + calculateFantasyScore(player);
  }, 0);

  const averageKeeperScore = keepers.length > 0 ? totalKeeperScore / keepers.length : 0;

  // Calculate team strength metrics if available
  const teamStrength = teamStats ? Math.min(100, (teamStats.totalFantasyScore / 2000) * 100) : 0;
  const leagueAverageStrength = leagueAverageStats ? Math.min(100, (leagueAverageStats.totalFantasyScore / 2000) * 100) : 50;

  return (
    <div className="space-y-6">
      {/* Keeper Summary Card */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Keeper Impact Summary
          </CardTitle>
          <CardDescription>
            How your keepers contribute to your team's overall strength
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Total Keeper Score</div>
              <div className="text-2xl font-bold">{totalKeeperScore.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-1">Combined fantasy points</div>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Average Keeper Score</div>
              <div className="text-2xl font-bold">{averageKeeperScore.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-1">Per player contribution</div>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Keepers Selected</div>
              <div className="text-2xl font-bold">{keepers.length}/9</div>
              <div className="text-xs text-muted-foreground mt-1">Max 9 keepers allowed</div>
            </div>
          </div>
          
          {keepers.length > 0 && (
            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Top Keeper Contributors</div>
              <div className="space-y-2">
                {keepers
                  .sort((a, b) => calculateFantasyScore(b) - calculateFantasyScore(a))
                  .slice(0, 3)
                  .map((player, index) => (
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
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Strength Comparison */}
      {teamStats && leagueAverageStats && (
        <Card className="bg-gradient-card shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Team Strength Comparison
            </CardTitle>
            <CardDescription>
              How your team ranks against the league average
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Your Team Strength</span>
                  <span>{teamStats.totalFantasyScore.toFixed(1)} pts</span>
                </div>
                <Progress value={teamStrength} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>League Average</span>
                  <span>{leagueAverageStats.totalFantasyScore.toFixed(1)} pts</span>
                </div>
                <Progress value={leagueAverageStrength} className="h-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-background/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Projected Rank</span>
                </div>
                <div className="text-xl font-bold">
                  {teamStats.totalFantasyScore > leagueAverageStats.totalFantasyScore ? 'Top Half' : 'Bottom Half'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Based on current keepers</div>
              </div>
              
              <div className="p-3 bg-background/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Competitive Edge</span>
                </div>
                <div className="text-xl font-bold">
                  {Math.abs(teamStats.totalFantasyScore - leagueAverageStats.totalFantasyScore).toFixed(1)} pts
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {teamStats.totalFantasyScore > leagueAverageStats.totalFantasyScore ? 'Above' : 'Below'} average
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keeper Benefits */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Keeper Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Retain your best players for next season</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Save early draft picks for new talent</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Maintain team chemistry and core identity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Build long-term competitive advantage</span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">Pro Tip:</span> Balance your keepers between star players and 
              value picks. Don't keep all your early-round picks - leave room for improvement!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};