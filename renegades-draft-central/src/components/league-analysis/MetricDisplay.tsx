import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricDisplayProps {
  label: string;
  teamValue: number;
  leagueAverage: number;
  formatValue?: (value: number) => string;
  isInverse?: boolean; // For metrics where lower is better (e.g., turnovers)
}

export const MetricDisplay = ({ 
  label, 
  teamValue, 
  leagueAverage, 
  formatValue = (value) => value.toFixed(1),
  isInverse = false
}: MetricDisplayProps) => {
  const difference = teamValue - leagueAverage;
  const isBetter = isInverse ? difference < 0 : difference > 0;
  
  const getTrendIcon = () => {
    if (Math.abs(difference) < 0.1) return <Minus className="h-4 w-4 text-gray-500" />;
    return isBetter ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (Math.abs(difference) < 0.1) return 'text-gray-500';
    return isBetter ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {getTrendIcon()}
        </div>
        <div className="text-2xl font-bold mb-1">{formatValue(teamValue)}</div>
        <div className={`text-xs flex items-center ${getTrendColor()}`}>
          {isBetter ? 'Above' : 'Below'} average ({formatValue(leagueAverage)})
        </div>
      </CardContent>
    </Card>
  );
};
