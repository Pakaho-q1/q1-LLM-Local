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
      className="relative flex"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors duration-150"
            style={{
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
      {/* Sliding indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          height: '2px',
          background: 'var(--accent)',
          borderRadius: '2px 2px 0 0',
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
          transition:
            'transform 0.28s cubic-bezier(0.16,1,0.3,1), width 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </div>
  );
};
