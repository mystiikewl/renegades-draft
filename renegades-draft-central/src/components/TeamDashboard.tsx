import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { TeamManagement } from '@/components/TeamManagement';
import { TeamSwitcher } from '@/components/TeamSwitcher';
import { TeamAdminDashboard } from '@/components/admin/TeamAdminDashboard';
import { useIsMobile } from '@/hooks/use-mobile';

export const TeamDashboard = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.is_admin;
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('my-team');

  const tabs = [
    { value: 'my-team', label: 'My Team' },
    { value: 'all-teams', label: 'All Teams' },
    ...(isAdmin ? [{ value: 'admin', label: 'Admin' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-primary">Team Hub</h1>
        <p className="text-muted-foreground">Manage your team and explore the league.</p>

        {isMobile ? (
          <div className="space-y-6">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              {activeTab === 'my-team' && (
                <TeamManagement />
              )}
              {activeTab === 'all-teams' && (
                <TeamSwitcher />
              )}
              {activeTab === 'admin' && isAdmin && (
                <TeamAdminDashboard />
              )}
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="my-team">My Team</TabsTrigger>
              <TabsTrigger value="all-teams">All Teams</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
            </TabsList>

            <TabsContent value="my-team">
              <TeamManagement />
            </TabsContent>
            <TabsContent value="all-teams">
              <TeamSwitcher />
            </TabsContent>
            {isAdmin && (
              <TabsContent value="admin">
                <TeamAdminDashboard />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};
