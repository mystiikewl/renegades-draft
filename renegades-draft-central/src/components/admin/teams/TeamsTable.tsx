import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeams } from '@/hooks/useTeams';

interface Team {
  id: string;
  name: string;
  owner_email: string | null;
}

interface TeamsTableProps {
  teamsData: Team[];
  handleEditTeam: (team: Team) => void;
  handleManageRoster: (team: Team) => void;
  handleManageKeepers: (team: Team) => void;
  handleDeleteTeam: (teamId: string) => void;
  setIsAddTeamDialogOpen: (isOpen: boolean) => void;
  setIsAddUserDialogOpen: (isOpen: boolean) => void;
}

export const TeamsTable = ({
  teamsData,
  handleEditTeam,
  handleManageRoster,
  handleManageKeepers,
  handleDeleteTeam,
  setIsAddTeamDialogOpen,
  setIsAddUserDialogOpen,
}: TeamsTableProps) => {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle>League Teams Overview</CardTitle>
        <CardDescription>Manage all fantasy teams in the league.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Button onClick={() => setIsAddTeamDialogOpen(true)}>Add New Team</Button>
          <Button onClick={() => setIsAddUserDialogOpen(true)} variant="secondary">Add New User</Button>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Team Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {teamsData.map((team) => (
                <tr key={team.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{team.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{team.owner_email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTeam(team)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleManageRoster(team)}>Roster</Button>
                      <Button variant="outline" size="sm" onClick={() => handleManageKeepers(team)}>Keepers</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTeam(team.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
