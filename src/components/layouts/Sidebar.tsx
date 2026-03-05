import React, { useState, useMemo } from 'react';
import { Tabs, TabItem } from '../ui/Tabs';
import { TabModels } from '../../features/models/components/TabModels';
import { TabSettings } from '../../features/settings/components/TabSettings';
import { ChatHistoryTab } from '../../features/history/components/ChatHistoryTab';

type TabType = 'history' | 'settings' | 'models';

export const Sidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('history');

  const menuTabs: TabItem[] = useMemo(
    () => [
      { id: 'history', label: 'History' },
      { id: 'models', label: 'Models' },
      { id: 'settings', label: 'Settings' },
    ],
    [],
  );

  return (
    <div className="flex flex-col h-full w-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-neutral-200 shrink-0 bg-slate-800">
        <h2 className="font-bold text-lg text-gray-50">System Control</h2>
        <button
          onClick={onClose}
          className="p-1 text-neutral-500 hover:bg-[#64748b] rounded"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 🟢 ใช้คอมโพเนนต์ Tabs ที่สร้างใหม่ */}
      <Tabs
        tabs={menuTabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as TabType)}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'history' && <ChatHistoryTab />}
        {activeTab === 'models' && <TabModels />}
        {activeTab === 'settings' && <TabSettings />}
      </div>
    </div>
  );
};
