import { useState, useEffect } from 'react';
import { TeamSelection } from '@/components/TeamSelection';
import { KeeperManagement } from '@/components/KeeperManagement';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Trophy, 
  Target, 
  TrendingUp, 
  Star, 
  Calendar, 
  Zap,
  Shield,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user, profile, onboardingComplete, isLoading } = useAuth();

  // Redirect user if they already have a team and have completed onboarding
  useEffect(() => {
    if (!isLoading && profile?.team && onboardingComplete) {
      navigate('/');
    } else if (!isLoading && profile?.team && !onboardingComplete) {
      // If user already has a team but hasn't completed onboarding, skip to step 2
      setStep(2);
    }
  }, [profile, onboardingComplete, isLoading, navigate]);

  const handleTeamSelected = () => {
    setStep(2);
  };

  const handleKeepersSelected = async () => {
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating onboarding status:', error);
      } else {
        console.log('Onboarding complete!');
        navigate('/teams');
      }
    }
  };

  // Show loading state while checking profile
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // If user already has a team and completed onboarding, they shouldn't be here
  if (profile?.team && onboardingComplete) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header Section */}
      <div className="text-center mb-10 mt-6">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Welcome to Renegades Draft!
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Build your fantasy basketball dynasty with friends. Draft, manage, and compete in the ultimate NBA fantasy experience.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-center gap-4 md:gap-8">
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Select Team</span>
          </div>
          
          <div className="h-1 w-16 md:w-24 bg-muted rounded-full"></div>
          
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Set Keepers</span>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      {step === 1 && (
        <div className="mb-10">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Build Your Fantasy Dynasty
              </CardTitle>
              <CardDescription>
                Everything you need to succeed in your fantasy basketball league
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Real-Time Drafting</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Experience live drafting with friends, complete with real NBA player statistics and performance tracking.
                  </p>
                </div>
                
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Keeper System</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Retain your best players for next season and build long-term competitive advantages with strategic keeper selections.
                  </p>
                </div>
                
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Advanced Analytics</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track performance with detailed metrics, power rankings, and categorical comparisons to optimize your roster.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Step Content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div>
              <TeamSelection onTeamSelected={handleTeamSelected} />
            </div>
          )}

          {step === 2 && (
            <div>
              <KeeperManagement onKeepersSelected={handleKeepersSelected} />
            </div>
          )}
        </div>

        {/* Sidebar with Tips and Info */}
        <div className="space-y-6">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Keeper Strategy</h4>
                <p className="text-xs">
                  Balance young talent with proven veterans. Don't keep all your early picks - save some for future drafts!
                </p>
              </div>
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Draft Preparation</h4>
                <p className="text-xs">
                  Research player rankings and create a strategy before the draft. Know your positional needs!
                </p>
              </div>
              
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Team Building</h4>
                <p className="text-xs">
                  Aim for balance across all categories. Don't focus only on points - rebounds and assists matter too!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                League Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">League Size</span>
                <Badge variant="secondary">10 Teams</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Roster Size</span>
                <Badge variant="secondary">Can't remember</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Draft Rounds</span>
                <Badge variant="secondary">Not too much</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Keeper Limit</span>
                <Badge variant="secondary">9 Players</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Draft Type</span>
                <Badge variant="secondary">Snake</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Success Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Win your division</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Make the playoffs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Win the championship</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Tank for a dynasty</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
