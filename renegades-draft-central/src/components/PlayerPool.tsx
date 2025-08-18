import React, { useState, useMemo, useEffect, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  User, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Trophy,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { PlayerDetailsModal } from '@/components/PlayerDetailsModal';

export type Player = Tables<'players'>;

interface PlayerPoolProps {
  players: Player[];
  onSelectPlayer?: (player: Player) => void;
  selectedPlayer?: Player | null;
  canMakePick?: boolean;
}

// Memoized Player Card component for better performance
const PlayerCard = memo(({ 
  player, 
  isSelected, 
  canMakePick, 
  onClick 
}: { 
  player: Player; 
  isSelected: boolean; 
  canMakePick: boolean | undefined; 
  onClick: () => void; 
}) => {
  const isUnavailable = player.is_drafted || player.is_keeper;
  const isClickable = canMakePick && !isUnavailable;
  
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
            {player.points ? `${player.points.toFixed(1)} PPG` : '0.0 PPG'}
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

export const PlayerPool = memo(({ players, onSelectPlayer, selectedPlayer, canMakePick }: PlayerPoolProps) => {
  usePerformanceMonitoring('PlayerPool');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('rank');
  const [showFilters, setShowFilters] = useState(false);
  const [minPoints, setMinPoints] = useState('');
  const [maxPoints, setMaxPoints] = useState('');
  const [minRebounds, setMinRebounds] = useState('');
  const [maxRebounds, setMaxRebounds] = useState('');
  const [showRookies, setShowRookies] = useState(false); // New state for rookie filter
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState<Player | null>(null);

  const isMobile = useIsMobile();

  // All available positions
  const allPositions = ['PG', 'SG', 'SF', 'PF', 'C'];
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);
  
  // Toggle position selection
  const togglePosition = (position: string) => {
    setSelectedPositions(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedPositions([]);
    setMinPoints('');
    setMaxPoints('');
    setMinRebounds('');
    setMaxRebounds('');
    setShowRookies(false); // Clear rookie filter
  };
  
  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    return debouncedSearchTerm !== '' || 
           selectedPositions.length > 0 || 
           minPoints !== '' || 
           maxPoints !== '' || 
           minRebounds !== '' || 
           maxRebounds !== '' ||
           showRookies; // Include rookie filter in hasFilters check
  }, [debouncedSearchTerm, selectedPositions, minPoints, maxPoints, minRebounds, maxRebounds, showRookies]);

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    let result = players.filter(player => !player.is_drafted && !player.is_keeper); // Filter out drafted and keeper players first
    
    // Apply search filter
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(player => 
        player.name.toLowerCase().includes(term) ||
        player.nba_team.toLowerCase().includes(term)
      );
    }
    
    // Apply position filter
    if (selectedPositions.length > 0) {
      result = result.filter(player => 
        selectedPositions.some(pos => player.position.includes(pos))
      );
    }
    
    // Apply points filter
    if (minPoints) {
      const min = parseFloat(minPoints);
      result = result.filter(player => 
        player.points !== null && player.points >= min
      );
    }
    
    if (maxPoints) {
      const max = parseFloat(maxPoints);
      result = result.filter(player => 
        player.points !== null && player.points <= max
      );
    }
    
    // Apply rebounds filter
    if (minRebounds) {
      const min = parseFloat(minRebounds);
      result = result.filter(player => 
        player.total_rebounds !== null && player.total_rebounds >= min
      );
    }
    
    if (maxRebounds) {
      const max = parseFloat(maxRebounds);
      result = result.filter(player => 
        player.total_rebounds !== null && player.total_rebounds <= max
      );
    }

    // Apply rookie filter
    if (showRookies) {
      result = result.filter(player => player.is_rookie);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'points':
          return (b.points || 0) - (a.points || 0);
        case 'rebounds':
          return (b.total_rebounds || 0) - (a.total_rebounds || 0);
        case 'assists':
          return (b.assists || 0) - (a.assists || 0);
        case 'rank':
        default:
          return (a.rank || 0) - (b.rank || 0);
      }
    });
    
    return result;
  }, [players, debouncedSearchTerm, selectedPositions, minPoints, maxPoints, minRebounds, maxRebounds, showRookies, sortOption]);

  const handlePlayerCardClick = (player: Player) => {
    if (canMakePick && !player.is_drafted && !player.is_keeper) {
      setSelectedPlayerForDetails(player);
      setShowPlayerDetails(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Main Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search players or teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-4 space-y-4 bg-gradient-card shadow-card">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Advanced Filters</h3>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
          
          {/* Position Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Positions</label>
            <div className="flex gap-2 flex-wrap">
              {allPositions.map((position) => (
                <Button
                  key={position}
                  variant={selectedPositions.includes(position) ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePosition(position)}
                  className="min-w-[60px]"
                >
                  {position}
                </Button>
              ))}
            </div>
          </div>

          {/* Rookie Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Player Type</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={showRookies ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRookies(!showRookies)}
                className="min-w-[60px]"
              >
                Rookies
              </Button>
            </div>
          </div>
          
          {/* Stats Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Points Per Game</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={minPoints}
                  onChange={(e) => setMinPoints(e.target.value)}
                  className="w-full"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Rebounds Per Game</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={minRebounds}
                  onChange={(e) => setMinRebounds(e.target.value)}
                  className="w-full"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={maxRebounds}
                  onChange={(e) => setMaxRebounds(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Sorting Options */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={sortOption === 'rank' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortOption('rank')}
                className="flex items-center gap-1"
              >
                <Trophy className="h-3 w-3" />
                Rank
              </Button>
              <Button
                variant={sortOption === 'name' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortOption('name')}
              >
                Name
              </Button>
              <Button
                variant={sortOption === 'points' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortOption('points')}
              >
                Points
              </Button>
              <Button
                variant={sortOption === 'rebounds' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortOption('rebounds')}
              >
                Rebounds
              </Button>
              <Button
                variant={sortOption === 'assists' ? "default" : "outline"}
                size="sm"
                onClick={() => setSortOption('assists')}
              >
                Assists
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedPlayers.length} player{filteredAndSortedPlayers.length !== 1 ? 's' : ''} found
        </div>
        {hasFilters && (
          <div className="text-sm">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filters Active
            </Badge>
          </div>
        )}
      </div>

      {/* Player Grid with Virtual Scrolling */}
      <div className="max-h-[500px] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAndSortedPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isSelected={selectedPlayer?.id === player.id}
              canMakePick={canMakePick}
              onClick={() => handlePlayerCardClick(player)}
            />
          ))}
        </div>
      </div>

      {filteredAndSortedPlayers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No players found matching your criteria</p>
          {hasFilters && (
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Player Details Modal */}
      <PlayerDetailsModal
        player={selectedPlayerForDetails}
        isOpen={showPlayerDetails}
        onClose={() => setShowPlayerDetails(false)}
        onConfirm={(player) => {
          onSelectPlayer?.(player);
          // setShowPlayerDetails(false) is handled in PlayerDetailsModal
        }}
        canMakePick={canMakePick}
      />
    </div>
  );
});
