import { TeamAdminDashboard } from '@/components/admin/TeamAdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

const TeamAdmin = () => {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-primary">Admin Team Management</h1>
          <p className="text-muted-foreground">Manage all teams and league settings as a commissioner.</p>
          <TeamAdminDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TeamAdmin;
