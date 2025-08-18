import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamStats } from '@/utils/leagueAnalysis';
import { RadarChartDataItem } from '@/hooks/useLeagueAnalysisData';

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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="teamName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalFantasyScore" fill="#8884d8" name="Total Fantasy Score" />
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
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name={selectedTeamName} dataKey={selectedTeamName} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="League Average" dataKey="League Average" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Legend />
                <Tooltip />
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
