import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamStats } from '@/utils/leagueAnalysis';
import { RadarChartDataItem } from '@/hooks/useLeagueAnalysisData';

// Custom tooltip with better contrast
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-md p-3 shadow-lg">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface VisualizationsProps {
  sortedByFantasyScore: TeamStats[];
  selectedTeamForRadar: string;
  setSelectedTeamForRadar: (teamId: string) => void;
  radarChartData: RadarChartDataItem[]; // Recharts data structure
  teamsData: { id: string; name: string }[];
  selectedTeamName: string;
}

const Visualizations: React.FC<VisualizationsProps> = ({
  sortedByFantasyScore,
  selectedTeamForRadar,
  setSelectedTeamForRadar,
  radarChartData,
  teamsData,
  selectedTeamName,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Team Fantasy Score Comparison</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedByFantasyScore}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="teamName" 
                stroke="hsl(var(--muted-foreground))" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar 
                dataKey="totalFantasyScore" 
                fill="hsl(var(--primary))" 
                name="Total Fantasy Score" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Team Strengths & Weaknesses (Radar Chart)</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTeamForRadar} onValueChange={setSelectedTeamForRadar}>
            <SelectTrigger className="w-[200px] mb-4">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teamsData.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTeamForRadar && radarChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} width={730} height={250} data={radarChartData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Radar 
                  name={selectedTeamName} 
                  dataKey={selectedTeamName} 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  name="League Average" 
                  dataKey="League Average" 
                  stroke="hsl(var(--accent))" 
                  fill="hsl(var(--accent))" 
                  fillOpacity={0.6} 
                />
                <Legend 
                  wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Select a team to view its radar chart.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Visualizations;
