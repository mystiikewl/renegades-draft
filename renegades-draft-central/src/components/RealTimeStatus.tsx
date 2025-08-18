import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConnectionStatus } from '@/hooks/useTeamPresence';

interface RealTimeStatusProps {
  activeTeams: { teamId: string; teamName: string }[];
  connectionStatus: ConnectionStatus;
}

export function RealTimeStatus({ activeTeams, connectionStatus }: RealTimeStatusProps) {
  const getConnectionIndicator = () => {
    let colorClass = '';
    let icon = null;
    let tooltipText = '';

    switch (connectionStatus) {
      case 'connected':
        colorClass = 'bg-green-500';
        icon = <Wifi className="h-3 w-3" />;
        tooltipText = 'Real-time connection active';
        break;
      case 'connecting':
        colorClass = 'bg-yellow-500';
        icon = <Loader2 className="h-3 w-3 animate-spin" />;
        tooltipText = 'Connecting to real-time service...';
        break;
      case 'reconnecting':
        colorClass = 'bg-orange-500';
        icon = <Loader2 className="h-3 w-3 animate-spin" />;
        tooltipText = 'Connection lost, attempting to reconnect...';
        break;
      case 'disconnected':
        colorClass = 'bg-red-500';
        icon = <WifiOff className="h-3 w-3" />;
        tooltipText = 'Disconnected from real-time service. Please refresh.';
        break;
      default:
        colorClass = 'bg-gray-500';
        icon = <WifiOff className="h-3 w-3" />;
        tooltipText = 'Unknown connection status';
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`h-3 w-3 rounded-full ${colorClass} flex items-center justify-center`}>
              {icon}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {getConnectionIndicator()}
      <Badge variant="secondary" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {activeTeams.length} {activeTeams.length === 1 ? 'Team' : 'Teams'} Active
      </Badge>
      
      {activeTeams.length > 0 && activeTeams.length <= 3 && (
        <div className="flex gap-1">
          {activeTeams.map((team) => (
            <Badge key={team.teamId} variant="outline" className="text-xs">
              {team.teamName}
            </Badge>
          ))}
        </div>
      )}
      
      {activeTeams.length > 3 && (
        <Badge variant="outline" className="text-xs">
          {activeTeams.map(t => t.teamName).join(', ')}
        </Badge>
      )}
    </div>
  );
}
