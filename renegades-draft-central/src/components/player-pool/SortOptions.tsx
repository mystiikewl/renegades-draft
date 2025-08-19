import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface SortOptionsProps {
  sortOption: string;
  setSortOption: (option: string) => void;
}

export const SortOptions = ({ sortOption, setSortOption }: SortOptionsProps) => {
  return (
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
  );
};