import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TeamStats } from '@/utils/leagueAnalysis';

interface TeamStrengthsWeaknessesProps {
  teamStats: TeamStats;
  leagueAverageStats: TeamStats;
}

interface CategoryComparison {
  category: string;
  teamValue: number;
  leagueAverage: number;
  difference: number;
  isBetter: boolean;
}

export const TeamStrengthsWeaknesses = ({ 
  teamStats, 
  leagueAverageStats 
}: TeamStrengthsWeaknessesProps) => {
  // Define the categories to analyze
  const categories: CategoryComparison[] = [
    {
      category: 'Points',
      teamValue: teamStats.points,
      leagueAverage: leagueAverageStats.points,
      difference: teamStats.points - leagueAverageStats.points,
      isBetter: teamStats.points > leagueAverageStats.points
    },
    {
      category: 'Rebounds',
      teamValue: teamStats.rebounds,
      leagueAverage: leagueAverageStats.rebounds,
      difference: teamStats.rebounds - leagueAverageStats.rebounds,
      isBetter: teamStats.rebounds > leagueAverageStats.rebounds
    },
    {
      category: 'Assists',
      teamValue: teamStats.assists,
      leagueAverage: leagueAverageStats.assists,
      difference: teamStats.assists - leagueAverageStats.assists,
      isBetter: teamStats.assists > leagueAverageStats.assists
    },
    {
      category: 'Steals',
      teamValue: teamStats.steals,
      leagueAverage: leagueAverageStats.steals,
      difference: teamStats.steals - leagueAverageStats.steals,
      isBetter: teamStats.steals > leagueAverageStats.steals
    },
    {
      category: 'Blocks',
      teamValue: teamStats.blocks,
      leagueAverage: leagueAverageStats.blocks,
      difference: teamStats.blocks - leagueAverageStats.blocks,
      isBetter: teamStats.blocks > leagueAverageStats.blocks
    },
    {
      category: '3PM',
      teamValue: teamStats.three_pointers_made,
      leagueAverage: leagueAverageStats.three_pointers_made,
      difference: teamStats.three_pointers_made - leagueAverageStats.three_pointers_made,
      isBetter: teamStats.three_pointers_made > leagueAverageStats.three_pointers_made
    },
    {
      category: 'Turnovers',
      teamValue: teamStats.turnovers,
      leagueAverage: leagueAverageStats.turnovers,
      difference: leagueAverageStats.turnovers - teamStats.turnovers, // Inverted for better/worse logic
      isBetter: teamStats.turnovers < leagueAverageStats.turnovers // Lower turnovers are better
    }
  ];

  // Sort to find top 3 strengths (highest positive differences) and weaknesses (highest negative differences)
  const strengths = [...categories]
    .filter(cat => cat.difference > 0)
    .sort((a, b) => b.difference - a.difference)
    .slice(0, 3);

  const weaknesses = [...categories]
    .filter(cat => cat.difference < 0)
    .sort((a, b) => a.difference - b.difference)
    .slice(0, 3);

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Team Analysis Summary
        </CardTitle>
        <CardDescription>
          Key strengths and areas for improvement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strengths Section */}
        {strengths.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Key Strengths
            </h3>
            <div className="space-y-2">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <span className="font-medium">{strength.category}</span>
                  <span className="text-sm text-green-600">
                    +{strength.difference.toFixed(1)} above average
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses Section */}
        {weaknesses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Areas for Improvement
            </h3>
            <div className="space-y-2">
              {weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <span className="font-medium">{weakness.category}</span>
                  <span className="text-sm text-red-600">
                    {weakness.difference.toFixed(1)} below average
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Balanced Team Message */}
        {strengths.length === 0 && weaknesses.length === 0 && (
          <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-blue-600">
              Your team is well-balanced with no significant strengths or weaknesses compared to the league average.
            </p>
          </div>
        )}

        {/* No Data Message */}
        {strengths.length === 0 && weaknesses.length === 0 && categories.some(cat => Math.abs(cat.difference) < 0.1) && (
          <div className="text-center p-4 bg-gray-500/10 rounded-lg border border-gray-500/20">
            <p className="text-gray-600">
              Your team's performance is very close to the league average across all categories.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
