import React, { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Shield, Activity } from 'lucide-react';
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
    case 'blocks':
      return {
        value: player.blocks?.toFixed(1) || '0.0',
        label: 'BPG'
      };
    case 'steals':
      return {
        value: player.steals?.toFixed(1) || '0.0',
        label: 'SPG'
      };
    case 'turnovers':
      return {
        value: player.turnovers?.toFixed(1) || '0.0',
        label: 'TPG'
      };
    case 'fieldGoalPercentage':
      return {
        value: player.field_goal_percentage?.toFixed(1) || '0.0',
        label: 'FG%'
      };
    case 'threePointPercentage':
      return {
        value: player.three_point_percentage?.toFixed(1) || '0.0',
        label: '3P%'
      };
    case 'freeThrowPercentage':
      return {
        value: player.free_throw_percentage?.toFixed(1) || '0.0',
        label: 'FT%'
      };
    case 'gamesPlayed':
      return {
        value: player.games_played?.toString() || '0',
        label: 'GP'
      };
    case 'minutesPerGame':
      return {
        value: player.minutes_per_game?.toFixed(1) || '0.0',
        label: 'MPG'
      };
    case 'fantasyScore':
      return {
        value: calculateFantasyScore(player).toFixed(1),
        label: 'Fantasy'
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
   isFocused?: boolean;
   canMakePick: boolean | undefined;
   onClick: () => void;
   sortOption: string;
   calculateFantasyScore: (player: Player) => number;
 }

export const PlayerCard = memo(({
   player,
   isSelected,
   isFocused = false,
   canMakePick,
   onClick,
   sortOption,
   calculateFantasyScore
}: PlayerCardProps) => {
   const [isHovered, setIsHovered] = useState(false);
   const isUnavailable = player.is_drafted || player.is_keeper;
   const isClickable = canMakePick && !isUnavailable;
   const statDisplay = getStatDisplay(player, sortOption);
   const fantasyScore = calculateFantasyScore(player);

  // Enhanced player analysis
  const getPlayerTrend = () => {
    if (!player.games_played || !player.minutes_per_game) return null;
    return player.games_played > 50 && player.minutes_per_game > 25 ? 'trending-up' : 'stable';
  };

  const playerTrend = getPlayerTrend();
  
  return (
    <Card
      key={player.id}
      className={cn(
        "p-4 transition-all duration-300 border-2 cursor-pointer relative overflow-hidden",
        "hover:scale-[1.02] hover:shadow-xl",
        isSelected && "ring-4 ring-primary ring-offset-2 bg-primary/5 shadow-2xl",
        isFocused && "ring-4 ring-blue-400 ring-offset-2 bg-blue-50/50 shadow-2xl",
        isClickable && "hover:bg-primary/5 hover:border-primary/40",
        isUnavailable && "opacity-60 bg-muted/30 border-dashed border-muted cursor-not-allowed",
        player.is_keeper && "border-yellow-400/50 bg-gradient-to-br from-yellow-50/50 to-amber-50/50",
        player.is_drafted && "border-red-400/50 bg-gradient-to-br from-red-50/50 to-rose-50/50"
      )}
      onClick={isClickable ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-bold text-base hover:underline cursor-pointer">
              {player.name}
            </div>
            {fantasyScore > 0 && (
              <div className="text-xs font-mono font-bold bg-primary/20 text-primary px-2 py-1 rounded backdrop-blur-sm">
                {fantasyScore.toFixed(1)}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground mb-2">{player.nba_team}</div>
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              {player.position}
            </Badge>
            {player.rank && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-orange-400" />
                <span className="text-xs font-bold text-orange-400">#{player.rank}</span>
              </div>
            )}
            {player.is_rookie && (
              <Badge variant="default" className="text-xs bg-green-600 text-white">
                R
              </Badge>
            )}
            {playerTrend === 'trending-up' && (
              <TrendingUp className="h-3 w-3 text-green-400" />
            )}
            {player.games_played && player.games_played > 50 && (
              <Activity className="h-3 w-3 text-blue-400" />
            )}
            {player.is_keeper && (
              <Shield className="h-3 w-3 text-yellow-400" />
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {isUnavailable && (
            <Badge
              variant="default"
              className={cn(
                "text-xs mb-1",
                player.is_keeper ? "bg-yellow-600 text-white" : "bg-gray-600 text-white"
              )}
            >
              {player.is_keeper ? "Keeper" : "Drafted"}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            {statDisplay.label === '#' ? `#${statDisplay.value}` : `${statDisplay.value} ${statDisplay.label}`}
          </div>
        </div>
      </div>
      {/* Enhanced Hover Effect Overlay */}
      {isHovered && isClickable && !isUnavailable && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <div className="bg-white/90 text-black text-xs px-2 py-1 rounded">
            Click for details
          </div>
        </div>
      )}

      {/* Unavailable Overlay */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-gray-600/20 flex items-center justify-center">
          <div className="bg-gray-600/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {player.is_keeper ? "Keeper Player" : "Already Drafted"}
          </div>
        </div>
      )}
    </Card>
  );
});

PlayerCard.displayName = 'PlayerCard';