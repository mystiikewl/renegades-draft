import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getTeamColorPalette } from '@/lib/teams';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DraftPick {
  round: number;
  pick: number;
  overallPick: number;
  team: string;
  player?: {
    name: string;
    position: string;
    nbaTeam: string;
    // Add more player stats here as needed for expandable details
    points?: number;
    rebounds?: number;
    assists?: number;
  };
  isActive?: boolean;
}

interface DraftBoardProps {
  picks: DraftPick[];
  teams: string[];
  currentPick: number;
}

export function DraftBoard({ picks, teams, currentPick }: DraftBoardProps) {
  const rounds = Math.max(...picks.map(p => p.round));
  const teamsCount = teams.length;

  const getPickByRoundAndPosition = (round: number, position: number) => {
    return picks.find(p => p.round === round && ((p.pick - 1) % teamsCount) + 1 === position);
  };

  return (
    <div className="w-full overflow-x-auto">
      {Array.from({ length: rounds }, (_, roundIndex) => {
        const round = roundIndex + 1;
        const isEvenRound = round % 2 === 0;
        
        return (
          <div key={round} className="mb-6">
            <h3 className="text-xl font-bold mb-4">Round {round}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: teamsCount }, (_, positionIndex) => {
                const position = isEvenRound ? teamsCount - positionIndex : positionIndex + 1;
                const pick = getPickByRoundAndPosition(round, position);
                
                if (!pick) return <div key={`${round}-${position}`} className="h-[150px]" />; // Placeholder for empty slots

                const isCurrentPick = pick.overallPick === currentPick;
                const isPicked = !!pick.player;
                const teamPalette = getTeamColorPalette(pick.team, teams);

                return (
                  <Card
                    key={`${round}-${position}`}
                    className={cn(
                      "relative overflow-hidden transition-all duration-300 border-2 border-transparent",
                      isCurrentPick && "ring-4 ring-draft-active ring-offset-2 animate-pulse-glow", // Enhanced current pick indicator
                      isPicked && "border-0", // Remove default border
                      !isPicked && !isCurrentPick && "bg-draft-available hover:shadow-lg"
                    )}
                    style={isPicked ? {
                      background: `linear-gradient(135deg, ${teamPalette.primary}, ${teamPalette.secondary})`,
                      color: teamPalette.text
                    } : {}}
                    onMouseEnter={(e) => {
                      if (!isPicked && !isCurrentPick) {
                        e.currentTarget.style.borderColor = teamPalette.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isPicked && !isCurrentPick) {
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className={cn(
                        "text-sm font-normal",
                        isPicked ? "text-white/90" : "text-muted-foreground"
                      )}>
                        {pick.overallPick}. {pick.team}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {isPicked ? (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="item-1" className="border-b-0">
                            <AccordionTrigger className={cn(
                              "py-0 text-base font-semibold hover:no-underline",
                              teamPalette.text === '#FFFFFF' ? "text-white" : "text-black"
                            )}>
                              {pick.player?.name}
                            </AccordionTrigger>
                            <AccordionContent className={cn(
                              "pt-2 text-sm",
                              teamPalette.text === '#FFFFFF' ? "text-white/90" : "text-black/90"
                            )}>
                              <div className="flex items-center gap-1 mb-1">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{
                                    backgroundColor: teamPalette.accent,
                                    color: teamPalette.text === '#FFFFFF' ? '#001f3f' : '#FFFFFF'
                                  }}
                                >
                                  {pick.player?.position}
                                </Badge>
                                <span className={cn(
                                  "text-xs opacity-80",
                                  teamPalette.text === '#FFFFFF' ? "text-white/80" : "text-black/80"
                                )}>
                                  {pick.player?.nbaTeam}
                                </span>
                              </div>
                              {pick.player?.points !== undefined && (
                                <p>Points: {pick.player.points}</p>
                              )}
                              {pick.player?.rebounds !== undefined && (
                                <p>Rebounds: {pick.player.rebounds}</p>
                              )}
                              {pick.player?.assists !== undefined && (
                                <p>Assists: {pick.player.assists}</p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <div className={cn(
                          "text-center text-sm font-medium",
                          isCurrentPick ? "text-draft-active-foreground" : "text-muted-foreground"
                        )}>
                          {isCurrentPick ? "ON THE CLOCK" : "Available"}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
