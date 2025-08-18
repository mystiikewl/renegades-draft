import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useDraftState } from '@/hooks/useDraftState';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, ListOrdered, UserRound, Users, RefreshCw, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const DraftAdmin: React.FC = () => {
  const { resetDraft, isDraftComplete, totalPicks, completedPicks, isLoadingDraftState } = useDraftState();
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleResetDraft = useCallback(async () => {
    if (!confirm('Are you sure you want to reset the entire draft? This will remove all picks and mark all players as undrafted.')) {
      return;
    }

    setIsResetting(true);
    await resetDraft();
    setIsResetting(false);
    toast({
      title: "Success",
      description: "Draft has been reset.",
    });
  }, [resetDraft, toast]);

  if (isLoadingDraftState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Draft Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all draft-related settings and operations.</p>
        </div>

        <div className="space-y-6">
          {/* Draft Status Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Draft Status
              </CardTitle>
              <CardDescription>Current state of the draft and reset functionality.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalPicks}</div>
                  <div className="text-sm text-muted-foreground">Total Picks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{completedPicks}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDraftComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isDraftComplete ? 'Complete' : 'In Progress'}
                  </div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
              </div>

              <Alert variant="destructive" className="border-destructive/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription>
                  Resetting the draft will remove all picks and mark all players as undrafted. This action cannot be undone.
                </AlertDescription>
                <div className="mt-4">
                  <Button
                    variant="destructive"
                    onClick={handleResetDraft}
                    disabled={isResetting}
                    className="w-full"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                    {isResetting ? 'Resetting...' : 'Reset Entire Draft'}
                  </Button>
                </div>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>Configure overall draft settings.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Button asChild className="w-full">
                    <Link to="/admin/draft/settings">Go to General Settings</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListOrdered className="h-5 w-5" />
                    Draft Order
                  </CardTitle>
                  <CardDescription>Manage the draft order for all rounds.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Button asChild className="w-full">
                    <Link to="/admin/draft/order">Go to Draft Order</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Operations Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserRound className="h-5 w-5" />
                    Picks Trading
                  </CardTitle>
                  <CardDescription>Facilitate trading of draft picks between teams.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Button asChild className="w-full">
                    <Link to="/admin/draft/trades">Go to Picks Trading</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Keeper Management
                  </CardTitle>
                  <CardDescription>Manage player keepers for each team.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Button asChild className="w-full">
                    <Link to="/admin/draft/keepers">Go to Keeper Management</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Button onClick={() => window.location.href = '/admin'} variant="outline">
            Back to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DraftAdmin;
