import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useDraftStatus } from '@/hooks/useDraftStatus';
import type { DraftPickWithRelations } from '@/integrations/supabase/types/draftPicks';

interface DraftStats {
  totalPicks: number;
  completedPicks: number;
  availablePlayers: number;
  progress: number;
}

interface OnClockBannerProps {
  draftStats: DraftStats;
  currentPick: DraftPickWithRelations | null;
  teams: string[];
  canMakePick: boolean;
  isMobile: boolean;
  navigate?: (path: string) => void;
}

export const OnClockBanner: React.FC<OnClockBannerProps> = ({
  currentPick,
  teams,
  isMobile,
  navigate
}) => {
  const { teamPalette } = useDraftStatus({
    draftStats: { totalPicks: 0, completedPicks: 0, availablePlayers: 0, progress: 0 },
    currentPick,
    teams,
    canMakePick: true
  });

  if (!currentPick || !teamPalette) return null;

  if (isMobile) {
    return (
      <div
        className="p-4 animate-court-slide rounded-lg border-2"
        style={{
          background: `linear-gradient(135deg, ${teamPalette.primary}15, ${teamPalette.secondary}10)`,
          borderColor: teamPalette.primary,
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 3s ease infinite, pulse-glow-team 2s ease-in-out infinite alternate',
          boxShadow: `0 0 20px ${teamPalette.accent}40`
        }}
      >
        <div className="flex flex-col items-center justify-between text-center">
          <div className="mb-3">
            <h3
              className="text-lg font-bold mb-1 font-montserrat"
              style={{
                color: teamPalette.text,
                textShadow: `0 0 10px ${teamPalette.accent}60`
              }}
            >
              {currentPick.current_team.name} is on the clock!
            </h3>
            <p className="text-primary-foreground/80">
              Pick #{currentPick.round * 100 + currentPick.pick_number} - Round {currentPick.round}, Pick {currentPick.pick_number}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="text-base px-4 py-2 transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: teamPalette.primary,
              color: teamPalette.text,
              borderColor: teamPalette.accent
            }}
            onClick={() => navigate?.('/draft')}
          >
            Make Your Pick
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 animate-court-slide rounded-lg border-2"
      style={{
        background: `linear-gradient(135deg, ${teamPalette.primary}15, ${teamPalette.secondary}10)`,
        borderColor: teamPalette.primary,
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 4s ease infinite, pulse-glow-team 2s ease-in-out infinite alternate',
        boxShadow: `0 0 20px ${teamPalette.accent}40`
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
        <div className="mb-4 md:mb-0">
          <h3
            className="text-xl md:text-2xl font-bold mb-2 font-montserrat flex items-center gap-2"
            style={{
              color: teamPalette.text,
              textShadow: `0 0 10px ${teamPalette.accent}60`
            }}
          >
            <div
              className="w-6 h-6 rounded-full animate-pulse"
              style={{
                backgroundColor: teamPalette.primary,
                boxShadow: `0 0 10px ${teamPalette.accent}80`
              }}
            />
            {currentPick.current_team.name} is on the clock!
          </h3>
          <p className="text-primary-foreground/80 text-lg">
            Pick #{currentPick.round * 100 + currentPick.pick_number} - Round {currentPick.round}, Pick {currentPick.pick_number}
          </p>
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="text-lg px-8 py-4 transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: teamPalette.primary,
            color: teamPalette.text,
            borderColor: teamPalette.accent
          }}
          onClick={() => navigate?.('/draft')}
        >
          Make Your Pick
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};