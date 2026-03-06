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
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const btn = container.querySelector<HTMLButtonElement>(
      `[data-tab="${activeTab}"]`,
    );
    if (btn) setIndicator({ width: btn.offsetWidth, left: btn.offsetLeft });
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      className="relative flex shrink-0 border-b border-[var(--border)] bg-[var(--bg-sidebar)]"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 border-none bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.01em] transition-colors duration-150 ${
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}

      <div
        className="absolute bottom-0 h-0.5 rounded-t-[2px] bg-[var(--accent)] transition-[transform,width] duration-300"
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
        }}
      />
    </div>
  );
};
