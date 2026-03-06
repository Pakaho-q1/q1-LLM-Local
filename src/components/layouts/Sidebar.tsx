import React, { useState, useMemo } from 'react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { TabModels } from '@/features/models/components/TabModels';
import { TabSettings } from '@/features/settings/components/TabSettings';
import { ChatHistoryTab } from '@/features/history/components/ChatHistoryTab';
import { History, Cpu, Settings, X } from 'lucide-react';

type TabType = 'history' | 'settings' | 'models';

export const Sidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('history');

  const menuTabs: TabItem[] = useMemo(
    () => [
      { id: 'history', label: 'History', icon: <History size={14} /> },
      { id: 'models', label: 'Models', icon: <Cpu size={14} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
    ],
    [],
  );

  return (
    <div
      className="flex flex-col h-full"
      style={{ width: '350px', minWidth: '350px' }}
    >
      {/* Sidebar Header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: '56px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-sidebar)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 2px 8px var(--accent-subtle)',
            }}
          >
            <span
              style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}
            >
              AI
            </span>
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            System Control
          </span>
        </div>
        <button onClick={onClose} className="icon-btn" title="Close sidebar">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={menuTabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as TabType)}
      />

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar p-4"
        style={{ background: 'var(--bg-sidebar)' }}
      >
        {activeTab === 'history' && <ChatHistoryTab />}
        {activeTab === 'models' && <TabModels />}
        {activeTab === 'settings' && <TabSettings />}
      </div>
    </div>
  );
};
