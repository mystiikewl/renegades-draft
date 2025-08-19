import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Trophy, Target, Users } from 'lucide-react';
import { TeamStats } from '@/utils/leagueAnalysis';
import { MetricDisplay } from '@/components/league-analysis/MetricDisplay';
import { TeamStrengthsWeaknesses } from '@/components/league-analysis/TeamStrengthsWeaknesses';

interface TeamAnalyticsProps {
  teamStats?: TeamStats;
  leagueAverageStats?: TeamStats;
}

export const TeamAnalytics = ({ 
  teamStats,
  leagueAverageStats 
}: TeamAnalyticsProps) => {
  if (!teamStats || !leagueAverageStats) {
    return (
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Team statistics data is not available.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate team strength metrics
  const teamStrength = Math.min(100, (teamStats.totalFantasyScore / 2000) * 100);
  const leagueAverageStrength = Math.min(100, (leagueAverageStats.totalFantasyScore / 2000) * 100);

  return (
    <div className="space-y-6">
      {/* Team Analysis Summary */}
      <TeamStrengthsWeaknesses 
        teamStats={teamStats} 
        leagueAverageStats={leagueAverageStats} 
      />

      {/* Team Strength Comparison */}
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
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>League Average</span>
                <span>{leagueAverageStats.totalFantasyScore.toFixed(1)} pts</span>
              </div>
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
              <div className="text-xs text-muted-foreground mt-1">Based on current roster</div>
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

      {/* Detailed Metrics Grid */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Detailed Team Metrics
          </CardTitle>
          <CardDescription>
            Performance breakdown across key statistical categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricDisplay 
              label="Points" 
              teamValue={teamStats.points} 
              leagueAverage={leagueAverageStats.points}
            />
            <MetricDisplay 
              label="Rebounds" 
              teamValue={teamStats.rebounds} 
              leagueAverage={leagueAverageStats.rebounds}
            />
            <MetricDisplay 
              label="Assists" 
              teamValue={teamStats.assists} 
              leagueAverage={leagueAverageStats.assists}
            />
            <MetricDisplay 
              label="Steals" 
              teamValue={teamStats.steals} 
              leagueAverage={leagueAverageStats.steals}
            />
            <MetricDisplay 
              label="Blocks" 
              teamValue={teamStats.blocks} 
              leagueAverage={leagueAverageStats.blocks}
            />
            <MetricDisplay 
              label="3PM" 
              teamValue={teamStats.three_pointers_made} 
              leagueAverage={leagueAverageStats.three_pointers_made}
            />
            <MetricDisplay 
              label="Turnovers" 
              teamValue={teamStats.turnovers} 
              leagueAverage={leagueAverageStats.turnovers}
              isInverse={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
