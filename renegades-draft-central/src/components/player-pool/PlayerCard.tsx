import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

export type Player = Tables<'players'>;

// Helper function to get display value and label based on sort option
const getStatDisplay = (player: Player, sortOption: string) => {
  switch (sortOption) {
    case 'points':
      return {
        value: player.points?.toFixed(1) || '0.0',
        label: 'PPG'
      };
    case 'rebounds':
      return {
        value: player.total_rebounds?.toFixed(1) || '0.0',
        label: 'RPG'
      };
    case 'assists':
      return {
        value: player.assists?.toFixed(1) || '0.0',
        label: 'APG'
      };
    case 'rank':
      return {
        value: player.rank?.toString() || 'N/A',
        label: '#'
      };
    default: // Default to PPG
      return {
        value: player.points?.toFixed(1) || '0.0',
        label: 'PPG'
      };
  }
};

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  canMakePick: boolean | undefined;
  onClick: () => void;
  sortOption: string;
}

export const PlayerCard = memo(({ 
  player, 
  isSelected, 
  canMakePick, 
  onClick,
  sortOption
}: PlayerCardProps) => {
  const isUnavailable = player.is_drafted || player.is_keeper;
  const isClickable = canMakePick && !isUnavailable;
  const statDisplay = getStatDisplay(player, sortOption);
  
  return (
    <Card
      key={player.id}
      className={cn(
        "p-4 transition-all duration-200 bg-gradient-card shadow-card relative",
        isSelected && "ring-2 ring-primary bg-primary/5",
        isClickable && "hover:bg-primary/5 cursor-pointer",
        isUnavailable && "opacity-50 bg-muted/50 border-dashed border-muted cursor-not-allowed"
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold text-sm mb-1">{player.name}</div>
          <div className="text-xs text-muted-foreground mb-2">{player.nba_team}</div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {player.position}
            </Badge>
            {player.rank && (
              <Badge variant="outline" className="text-xs">
                #{player.rank}
              </Badge>
            )}
            {player.is_rookie && (
              <Badge variant="default" className="text-xs bg-blue-600 text-white">
                Rookie
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {isUnavailable && (
            <Badge variant="default" className="text-xs mb-1 bg-gray-600 text-white">
              {player.is_keeper ? "Keeper" : "Drafted"}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            {statDisplay.label === '#' ? `#${statDisplay.value}` : `${statDisplay.value} ${statDisplay.label}`}
          </div>
        </div>
      </div>
      {isClickable && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10 rounded-lg">
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            View Details
          </span>
        </div>
      )}
      {isUnavailable && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gray-600/80 text-white text-xs px-2 py-1 rounded">
            {player.is_keeper ? "Keeper" : "Drafted"}
          </div>
        </div>
      )}
    </Card>
  );
});

PlayerCard.displayName = 'PlayerCard';