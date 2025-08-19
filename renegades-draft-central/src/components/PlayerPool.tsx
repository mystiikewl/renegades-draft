import React, { useState, useMemo, useEffect, memo } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { PlayerDetailsModal } from '@/components/PlayerDetailsModal';
import type { Tables } from '@/integrations/supabase/types';
import { PlayerCard } from './player-pool/PlayerCard';
import { SearchBar } from './player-pool/SearchBar';
import { FilterPanel } from './player-pool/FilterPanel';
import { ResultsSummary } from './player-pool/ResultsSummary';
import { NoResults } from './player-pool/NoResults';

export type Player = Tables<'players'>;

interface PlayerPoolProps {
  players: Player[];
  onSelectPlayer?: (player: Player) => void;
  selectedPlayer?: Player | null;
  canMakePick?: boolean;
}

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
  const [showRookies, setShowRookies] = useState(false);
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState<Player | null>(null);

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
    setShowRookies(false);
  };
  
  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    return debouncedSearchTerm !== '' || 
           selectedPositions.length > 0 || 
           minPoints !== '' || 
           maxPoints !== '' || 
           minRebounds !== '' || 
           maxRebounds !== '' ||
           showRookies;
  }, [debouncedSearchTerm, selectedPositions, minPoints, maxPoints, minRebounds, maxRebounds, showRookies]);

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    let result = players.filter(player => !player.is_drafted && !player.is_keeper);
    
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
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      
      {showFilters && (
        <FilterPanel
          hasFilters={hasFilters}
          clearFilters={clearFilters}
          selectedPositions={selectedPositions}
          togglePosition={togglePosition}
          showRookies={showRookies}
          setShowRookies={setShowRookies}
          minPoints={minPoints}
          maxPoints={maxPoints}
          setMinPoints={setMinPoints}
          setMaxPoints={setMaxPoints}
          minRebounds={minRebounds}
          maxRebounds={maxRebounds}
          setMinRebounds={setMinRebounds}
          setMaxRebounds={setMaxRebounds}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />
      )}
      
      <ResultsSummary 
        playerCount={filteredAndSortedPlayers.length}
        hasFilters={hasFilters}
      />

      {/* Player Grid */}
      <div className="max-h-[500px] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAndSortedPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isSelected={selectedPlayer?.id === player.id}
              canMakePick={canMakePick}
              onClick={() => handlePlayerCardClick(player)}
              sortOption={sortOption}
            />
          ))}
        </div>
      </div>

      {filteredAndSortedPlayers.length === 0 && (
        <NoResults 
          hasFilters={hasFilters}
          clearFilters={clearFilters}
        />
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