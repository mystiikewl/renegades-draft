import React from 'react';
import { Trophy, Users, Clock, Target } from 'lucide-react';

interface DraftStatsBarProps {
  draftStats: {
    totalPicks: number;
    completedPicks: number;
    availablePlayers: number;
    progress: number;
  };
}

const DraftStatsBar: React.FC<DraftStatsBarProps> = ({ draftStats }) => {
  return (
    <div className="border-b border-border bg-card py-4 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-base font-medium">Total Picks</span>
            </div>
            <div className="text-2xl font-bold font-montserrat">{draftStats.totalPicks}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-5 w-5 text-draft-picked" />
              <span className="text-base font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold text-draft-picked font-montserrat">
              {draftStats.completedPicks}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-base font-medium">Available</span>
            </div>
            <div className="text-2xl font-bold font-montserrat">{draftStats.availablePlayers}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-draft-active" />
              <span className="text-base font-medium">Progress</span>
            </div>
            <div className="text-2xl font-bold font-montserrat">
              {draftStats.progress}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftStatsBar;
