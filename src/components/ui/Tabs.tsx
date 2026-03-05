// src/components/ui/Tabs.tsx
import React, { useEffect, useRef, useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'primary' | 'secondary';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'primary',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeButton = container.querySelector<HTMLButtonElement>(
      `[data-tab="${activeTab}"]`,
    );

    if (activeButton) {
      setIndicatorStyle({
        width: activeButton.offsetWidth,
        left: activeButton.offsetLeft,
      });
    }
  }, [activeTab, tabs]);

  const baseStyle =
    variant === 'primary'
      ? 'text-gray-50 hover:text-gray-400'
      : 'text-gray-50 hover:text-gray-400';

  return (
    <div
      ref={containerRef}
      className="relative flex  border-neutral-200 bg-transparent/30"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative px-5 py-3 text-sm font-medium
              transition-colors duration-200
              flex items-center gap-2
              ${baseStyle}
              ${isActive ? 'text-blue-600' : ''}
            `}
          >
            {tab.icon && <span className="opacity-80">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
      <div
        className="absolute bottom-0 h-[2px] bg-blue-600 transition-all duration-300 ease-out"
        style={{
          width: indicatorStyle.width,
          transform: `translateX(${indicatorStyle.left}px)`,
        }}
      />
    </div>
  );
};
