import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DraftBoard } from '@/components/DraftBoard';
import { DraftTimeline } from '@/components/DraftTimeline';
import { PlayerPool } from '@/components/PlayerPool';
import type { Player as PlayerType } from '@/components/player-pool/PlayerCard';
import { TeamRoster } from '@/components/TeamRoster';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, ListOrdered, ArrowRight } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DraftPickWithRelations } from '@/integrations/supabase/types/draftPicks';
import { useIsMobile } from '@/hooks/use-mobile';

// Define the type for draftPicksFormatted
interface DraftPickFormatted {
  round: number;
  pick: number;
  overallPick: number;
  team: string;
  player: {
    id: string;
    name: string;
    position: string;
    nbaTeam: string;
  } | undefined;
}

interface DraftTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile: boolean; // Added isMobile prop
  navigate: (path: string) => void;
  canMakePick: boolean;
  currentPick: DraftPickWithRelations | null;
  players: PlayerType[];
  onSelectPlayer: (player: PlayerType) => void;
  selectedPlayer: PlayerType | null;
  draftPicksFormatted: DraftPickFormatted[];
  teams: string[];
  currentPickIndex: number;
  draftView: 'board' | 'timeline';
  setDraftView: (view: 'board' | 'timeline') => void;
  selectedTeam: string;
  setSelectedTeam: (teamName: string) => void;
  selectedTeamId: string;
  currentSeason: string;
  getDraftedPlayersForTeam: (teamName: string) => (Tables<'players'> & { round: number; pick: number; overallPick: number; nbaTeam: string; })[];
  draftStats: {
    totalPicks: number;
    completedPicks: number;
    availablePlayers: number;
    progress: number;
  };
}

const DraftTabs: React.FC<DraftTabsProps> = ({
  activeTab,
  setActiveTab,
  navigate,
  canMakePick,
  currentPick,
  players,
  onSelectPlayer,
  selectedPlayer,
  draftPicksFormatted,
  teams,
  currentPickIndex,
  draftView,
  setDraftView,
  selectedTeam,
  setSelectedTeam,
  selectedTeamId,
  currentSeason,
  getDraftedPlayersForTeam,
  draftStats,
}) => {
  const isMobile = useIsMobile();
  
  const tabs = [
    { value: 'board', label: 'Draft Board' },
    { value: 'players', label: 'Player Pool' },
    { value: 'teams', label: 'Team Rosters' },
    { value: 'league-analysis', label: 'League Analysis' },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      {/* Responsive Tab Navigation */}
      {isMobile ? (
        <div className="space-y-4">
          <Select value={activeTab} onValueChange={(value) => {
            if (value === 'league-analysis') {
              navigate('/league-analysis');
            } else {
              setActiveTab(value);
            }
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a tab" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {draftStats.totalPicks > 0 && draftStats.completedPicks >= draftStats.totalPicks ? (
            <div className="p-4 bg-green-600/20 border border-green-600 rounded-lg">
              <div className="flex flex-col items-center justify-between text-center">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-green-500 mb-1 font-montserrat">
                    Draft Complete!
                  </h3>
                  <p className="text-primary-foreground/80">
                    All {draftStats.totalPicks} picks have been made
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'board' && canMakePick && (
            <div className="p-4 bg-gradient-active border-draft-active animate-court-slide rounded-lg">
              <div className="flex flex-col items-center justify-between text-center">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-draft-active-foreground mb-1 font-montserrat">
                    {currentPick.current_team.name} is on the clock!
                  </h3>
                  <p className="text-primary-foreground/80">
                    Pick #{currentPickIndex + 1} - Round {currentPick.round}, Pick {currentPick.pick_number}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-base px-4 py-2"
                  onClick={() => setActiveTab('players')}
                >
                  Make Your Pick
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="board">Draft Board</TabsTrigger>
            <TabsTrigger value="players">Player Pool</TabsTrigger>
            <TabsTrigger value="teams">Team Rosters</TabsTrigger>
            <TabsTrigger value="league-analysis" onClick={() => navigate('/league-analysis')}>League Analysis</TabsTrigger>
          </TabsList>
          
          {draftStats.totalPicks > 0 && draftStats.completedPicks >= draftStats.totalPicks ? (
            <div className="p-6 bg-green-600/20 border border-green-600 rounded-lg">
              <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl md:text-2xl font-bold text-green-500 mb-2 font-montserrat">
                    Draft Complete!
                  </h3>
                  <p className="text-primary-foreground/80 text-lg">
                    All {draftStats.totalPicks} picks have been made
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'board' && canMakePick && (
            <div className="p-6 bg-gradient-active border-draft-active animate-court-slide rounded-lg">
              <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl md:text-2xl font-bold text-draft-active-foreground mb-2 font-montserrat">
                    {currentPick.current_team.name} is on the clock!
                  </h3>
                  <p className="text-primary-foreground/80 text-lg">
                    Pick #{currentPickIndex + 1} - Round {currentPick.round}, Pick {currentPick.pick_number}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-lg px-8 py-4"
                  onClick={() => setActiveTab('players')}
                >
                  Make Your Pick
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Draft Board Tab */}
      <TabsContent value="board" className="space-y-6">
        {!isMobile && (
          <div className="flex justify-end mb-4">
            <ToggleGroup
              type="single"
              value={draftView}
              onValueChange={(value: 'board' | 'timeline') => value && setDraftView(value)}
              className="bg-card p-1 rounded-lg shadow-sm"
            >
              <ToggleGroupItem value="board" aria-label="Toggle grid view" className="px-3 py-2 text-sm">
                <LayoutGrid className="h-4 w-4 mr-2" /> Grid View
              </ToggleGroupItem>
              <ToggleGroupItem value="timeline" aria-label="Toggle timeline view" className="px-3 py-2 text-sm">
                <ListOrdered className="h-4 w-4 mr-2" /> Timeline View
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h3 className="text-xl md:text-2xl font-bold font-montserrat">
              {draftView === 'board' ? 'Draft Board' : 'Draft History Timeline'}
            </h3>
            {isMobile && (
              <ToggleGroup
                type="single"
                value={draftView}
                onValueChange={(value: 'board' | 'timeline') => value && setDraftView(value)}
                className="bg-card p-1 rounded-lg shadow-sm w-full sm:w-auto"
              >
                <ToggleGroupItem value="board" aria-label="Toggle grid view" className="px-3 py-2 text-sm flex-1">
                  <LayoutGrid className="h-4 w-4 mr-2" /> Grid
                </ToggleGroupItem>
                <ToggleGroupItem value="timeline" aria-label="Toggle timeline view" className="px-3 py-2 text-sm flex-1">
                  <ListOrdered className="h-4 w-4 mr-2" /> Timeline
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          </div>
          
          {draftStats.totalPicks > 0 && draftStats.completedPicks >= draftStats.totalPicks ? (
            <div className="text-center py-12">
              <div className="bg-card p-8 rounded-lg shadow-lg max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-green-500 mb-2">Draft Complete!</h3>
                <p className="text-muted-foreground mb-4">
                  All {draftStats.totalPicks} picks have been made. The fantasy draft is now complete.
                </p>
                <p className="text-sm text-muted-foreground">
                  View the completed draft board below.
                </p>
              </div>
            </div>
          ) : null}
          
          {draftView === 'board' ? (
            <DraftBoard
              picks={draftPicksFormatted}
              teams={teams}
              currentPick={currentPickIndex + 1}
            />
          ) : (
            <DraftTimeline
              picks={draftPicksFormatted}
              teams={teams}
              currentPick={currentPickIndex + 1}
            />
          )}
        </div>
      </TabsContent>

      {/* Player Pool Tab */}
      <TabsContent value="players" className="space-y-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 text-center md:text-left gap-2">
            <h3 className="text-xl md:text-2xl font-bold font-montserrat">Available Players</h3>
            {canMakePick && (
              <Badge variant="outline" className="bg-draft-active/10 text-base py-2 px-4">
                Making pick for {currentPick.current_team.name}
              </Badge>
            )}
          </div>
          
          {draftStats.totalPicks > 0 && draftStats.completedPicks >= draftStats.totalPicks ? (
            <div className="text-center py-12">
              <div className="bg-card p-8 rounded-lg shadow-lg max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-green-500 mb-2">Draft Complete!</h3>
                <p className="text-muted-foreground mb-4">
                  All {draftStats.totalPicks} picks have been made. The fantasy draft is now complete.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can still view team rosters and analyze the draft results.
                </p>
              </div>
            </div>
          ) : (
            <PlayerPool
              players={players}
              onSelectPlayer={onSelectPlayer}
              selectedPlayer={selectedPlayer}
              canMakePick={canMakePick}
            />
          )}
        </div>
      </TabsContent>

      {/* Team Rosters Tab */}
      <TabsContent value="teams" className="space-y-6">
        {draftStats.totalPicks > 0 && draftStats.completedPicks >= draftStats.totalPicks && (
          <div className="text-center py-4">
            <Badge variant="default" className="bg-green-600 text-white">
              Draft Complete - All {draftStats.totalPicks} picks made
            </Badge>
          </div>
        )}
        
        <div className="grid gap-4 mb-6">
          <div className="flex overflow-x-auto pb-2 -mx-2 px-2">
            <ToggleGroup
              type="single"
              value={selectedTeam}
              onValueChange={(value) => value && setSelectedTeam(value)}
              className="flex gap-2 min-w-max"
            >
              {teams.map((team) => (
                <ToggleGroupItem
                  key={team}
                  value={team}
                  aria-label={`Select ${team}`}
                  className="text-sm sm:text-base px-3 py-2 whitespace-nowrap"
                >
                  {team}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <TeamRoster
          teamName={selectedTeam}
          teamId={selectedTeamId}
          season={currentSeason}
          draftedPlayers={getDraftedPlayersForTeam(selectedTeam)}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DraftTabs;
