import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateFantasyScore } from '@/utils/fantasyScore';
import type { Player } from './player-pool/PlayerCard';
import { 
  Trophy, 
  Target, 
  Users, 
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { makeDraftPick } from '@/hooks/makeDraftPick';
import { supabase } from '@/integrations/supabase/client';

interface PlayerDetailsModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (player: Player) => void;
  canMakePick?: boolean;
}

export const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({
  player,
  isOpen,
  onClose,
  onConfirm,
  canMakePick
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isMakingPick, setIsMakingPick] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  if (!player) return null;

  const fantasyScore = calculateFantasyScore(player);

  const handleSelectClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSelection = async () => {
    if (!player) return;
    
    setShowConfirmDialog(false);
    setIsMakingPick(true);
    
    try {
      // Verify user has a team
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('team_id, teams(name)')
          .eq('user_id', user.id)
          .single();

        if (!userProfile?.team_id) {
          toast({
            title: "Error",
            description: "You are not assigned to a team. Please contact the draft administrator.",
            variant: "destructive",
          });
          setIsMakingPick(false);
          return;
        }
      }

      // Make the draft pick
      const result = await makeDraftPick(player.id);
      
      // Close the modal and notify success
      onClose();
      toast({
        title: "Pick confirmed!",
        description: `${result.current_team.name} selected ${player.name}`,
      });
      
      // Call onConfirm to update parent state if needed
      onConfirm(player);
    } catch (error: unknown) {
      console.error('Error making draft pick:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (errorMessage.includes('already been drafted')) {
        toast({
          title: "Error",
          description: "This player has already been drafted by another team.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('already been used')) {
        toast({
          title: "Error",
          description: "This draft pick has already been used. The draft state may have changed.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('is a keeper')) {
        toast({
          title: "Error",
          description: "This player is a keeper and cannot be drafted.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Failed to make draft pick. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsMakingPick(false);
    }
  };

  const handleCancelSelection = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Dialog open={isOpen && !showConfirmDialog} onOpenChange={onClose}>
        <DialogContent 
          className={`flex flex-col max-h-[90vh] ${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px]'}`}
        >
          <DialogHeader className={isMobile ? "flex-shrink-0" : ""}>
            <DialogTitle className={`text-2xl ${isMobile ? 'text-xl' : ''}`}>{player.name}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2">
              <span>{player.position}</span>
              <span>•</span>
              <span>{player.nba_team}</span>
              {(player.is_drafted || player.is_keeper) && (
                <Badge variant="default" className="ml-2 bg-gray-600 text-white">
                  {player.is_keeper ? "Keeper" : "Drafted"}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto space-y-6 py-2">
            {/* Player Stats Summary */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
              <Card className="p-3 text-center">
                <div className={`font-bold text-primary ${isMobile ? 'text-xl' : 'text-2xl'}`}>{player.points?.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-muted-foreground">PPG</div>
              </Card>
              
              <Card className="p-3 text-center">
                <div className={`font-bold text-primary ${isMobile ? 'text-xl' : 'text-2xl'}`}>{player.total_rebounds?.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-muted-foreground">RPG</div>
              </Card>
              
              <Card className="p-3 text-center">
                <div className={`font-bold text-primary ${isMobile ? 'text-xl' : 'text-2xl'}`}>{player.assists?.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-muted-foreground">APG</div>
              </Card>
              
              <Card className="p-3 text-center">
                <div className={`font-bold text-primary ${isMobile ? 'text-xl' : 'text-2xl'}`}>{player.steals?.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-muted-foreground">SPG</div>
              </Card>
              
              <Card className="p-3 text-center">
                <div className={`font-bold text-primary ${isMobile ? 'text-xl' : 'text-2xl'}`}>{player.blocks?.toFixed(1) || '0.0'}</div>
                <div className="text-sm text-muted-foreground">BPG</div>
              </Card>
              
              <Card className="p-3 text-center">
                <div className={`font-bold text-primary ${isMobile ? 'text-xl' : 'text-2xl'}`}>{fantasyScore.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Fantasy Score</div>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-4">
              <h3 className={`font-semibold ${isMobile ? 'text-lg' : 'text-lg'}`}>Detailed Statistics</h3>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Field Goal %</span>
                  </div>
                  <span className="font-medium">{player.field_goal_percentage?.toFixed(3) || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Free Throw %</span>
                  </div>
                  <span className="font-medium">{player.free_throw_percentage?.toFixed(3) || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">3PM</span>
                  </div>
                  <span className="font-medium">{player.three_pointers_made?.toFixed(1) || '0.0'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Turnovers</span>
                  </div>
                  <span className="font-medium">{player.turnovers?.toFixed(1) || '0.0'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Games Played</span>
                  </div>
                  <span className="font-medium">{player.games_played || '0'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Rank</span>
                  </div>
                  <span className="font-medium">#{player.rank || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Player Info */}
            <div className="space-y-4">
              <h3 className={`font-semibold ${isMobile ? 'text-lg' : 'text-lg'}`}>Player Information</h3>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Age</span>
                  <span className="font-medium">{player.age || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Experience</span>
                  <span className="font-medium">{player.experience === 'Rookie' ? 'Rookie' : 'NBA Player'}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className={`gap-2 ${isMobile ? 'flex-col' : 'sm:justify-between'}`}>
            <Button variant="outline" onClick={onClose} className={isMobile ? "w-full" : ""}>
              Cancel
            </Button>
            {canMakePick && !player.is_drafted && !player.is_keeper && (
              <Button onClick={handleSelectClick} className={isMobile ? "w-full" : ""}>
                Select {player.name}
              </Button>
            )}
            {(player.is_drafted || player.is_keeper) && (
              <Button disabled variant="secondary" className={isMobile ? "w-full" : ""}>
                {player.is_keeper ? "Keeper Player" : "Already Drafted"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className={isMobile ? "w-[90vw] max-w-[90vw]" : ""}>
          <DialogHeader>
            <DialogTitle>Confirm Player Selection</DialogTitle>
            <DialogDescription>
              Are you sure you want to select <span className="font-bold">{player.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={`gap-2 ${isMobile ? 'flex-col' : ''}`}>
            <Button variant="outline" onClick={handleCancelSelection} className={isMobile ? "w-full" : ""} disabled={isMakingPick}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSelection} className={isMobile ? "w-full" : ""} disabled={isMakingPick}>
              {isMakingPick ? "Confirming..." : "Confirm Selection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};