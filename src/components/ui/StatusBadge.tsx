import React from 'react';

interface StatusBadgeProps {
  status: 'running' | 'loading' | 'stopped';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const base =
    'px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-2';
  if (status === 'running')
    return (
      <span className={`${base} bg-green-600 text-white`}>
        {label || 'Running'}
      </span>
    );
  if (status === 'loading')
    return (
      <span className={`${base} bg-yellow-500 text-black`}>
        {label || 'Loading'}
      </span>
    );
  return (
    <span className={`${base} bg-red-600 text-white`}>
      {label || 'No Model'}
    </span>
  );
};

export default StatusBadge;
