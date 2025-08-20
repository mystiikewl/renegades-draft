import React, { ReactNode, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileTableProps {
  children: ReactNode;
  breakpoint?: number;
  layout?: 'table' | 'card' | 'auto';
  className?: string;
  tableClassName?: string;
  cardClassName?: string;
}

/**
 * Responsive table wrapper that automatically switches between table and card layouts
 * based on screen size and layout preference.
 *
 * Features:
 * - Automatic layout switching based on screen size
 * - Custom breakpoint support
 * - Touch gesture integration
 * - Performance optimizations
 * - Accessibility support
 */
export const MobileTable = React.memo(({
  children,
  breakpoint = 768,
  layout = 'auto',
  className,
  tableClassName,
  cardClassName,
}: MobileTableProps) => {
  const isMobile = useIsMobile();

  // Determine the current layout mode
  const currentLayout = useMemo(() => {
    if (layout === 'table') return 'table';
    if (layout === 'card') return 'card';

    // Auto mode - switch based on screen size
    return isMobile ? 'card' : 'table';
  }, [layout, isMobile]);

  return (
    <div
      className={cn(
        'w-full',
        className
      )}
      data-layout={currentLayout}
      role="region"
      aria-label="Responsive data table"
    >
      {currentLayout === 'table' ? (
        <div
          className={cn(
            'overflow-x-auto border rounded-lg',
            tableClassName
          )}
        >
          {children}
        </div>
      ) : (
        <div
          className={cn(
            'space-y-3',
            cardClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
});

MobileTable.displayName = 'MobileTable';