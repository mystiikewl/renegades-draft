import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TabConfig } from '@/config/draftTabsConfig';

interface DraftTabNavigationProps {
  tabs: readonly TabConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile: boolean;
  navigate?: (path: string) => void;
}

export const DraftTabNavigation: React.FC<DraftTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  isMobile,
  navigate
}) => {
  const handleTabChange = (value: string) => {
    const tab = tabs.find(t => t.value === value);
    if (tab?.isRoute && navigate) {
      navigate('/league-analysis');
    } else {
      onTabChange(value);
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a tab" />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <TabsList className="grid w-full grid-cols-5">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          onClick={() => handleTabChange(tab.value)}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};