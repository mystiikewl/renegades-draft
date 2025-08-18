import { PlayerImportAdmin } from '@/components/PlayerImportAdmin';
import { Button } from '@/components/ui/button';
import AdminSettings from '@/components/admin/AdminSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-primary">League Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your league settings, players, and teams.</p>

        <div className="space-y-6">
          <AdminSettings /> {/* This now acts as a navigation hub */}
          
          <Card>
            <CardHeader>
              <CardTitle>Player Management</CardTitle>
              <CardDescription>Import and manage player data.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerImportAdmin />
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Back to Draft
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
