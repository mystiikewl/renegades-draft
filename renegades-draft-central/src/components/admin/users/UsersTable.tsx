import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Team {
  id: string;
  name: string;
  owner_email: string | null;
}

interface Profile {
  id: string;
  email: string;
  team_id: number | null;
}

interface UsersTableProps {
  allProfiles: Profile[];
  teamsData: Team[];
  handleEditUser: (user: Profile) => void;
  handleRemoveUserFromTeam: (userId: string) => void;
  confirmDeleteUser: (user: Profile) => void;
}

export const UsersTable = ({
  allProfiles,
  teamsData,
  handleEditUser,
  handleRemoveUserFromTeam,
  confirmDeleteUser,
}: UsersTableProps) => {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle>League Users Overview</CardTitle>
        <CardDescription>Manage all user accounts in the league.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {allProfiles.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {teamsData.find(team => parseInt(team.id, 10) === user.team_id)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                      {user.team_id && (
                        <Button variant="secondary" size="sm" onClick={() => handleRemoveUserFromTeam(user.id)}>Remove from Team</Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => confirmDeleteUser(user)}>Delete</Button>
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
