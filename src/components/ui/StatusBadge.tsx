import React from 'react';

interface StatusBadgeProps {
  status: 'running' | 'loading' | 'stopped';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = {
    running: {
      dot: 'var(--success)',
      text: 'var(--success)',
      bg: 'var(--success)',
      bgOp: '0.1',
      border: 'var(--success)',
      borderOp: '0.3',
      pulse: true,
    },
    loading: {
      dot: 'var(--warning)',
      text: 'var(--warning)',
      bg: 'var(--warning)',
      bgOp: '0.1',
      border: 'var(--warning)',
      borderOp: '0.3',
      pulse: false,
    },
    stopped: {
      dot: 'var(--text-tertiary)',
      text: 'var(--text-tertiary)',
      bg: 'var(--bg-hover)',
      bgOp: '1',
      border: 'var(--border)',
      borderOp: '1',
      pulse: false,
    },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{
        color: config.text,
        background: `color-mix(in srgb, ${config.bg} ${parseInt(config.bgOp) * 100 || 10}%, transparent)`,
        borderColor: `color-mix(in srgb, ${config.border} 30%, transparent)`,
      }}
    >
      {status === 'loading' ? (
        <span
          style={{
            width: 8,
            height: 8,
            border: `2px solid ${config.dot}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spinSlow 1.2s linear infinite',
            flexShrink: 0,
          }}
        />
      ) : (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: config.dot,
            display: 'inline-block',
            flexShrink: 0,
            animation: config.pulse
              ? 'pulseDot 1.5s ease-in-out infinite'
              : 'none',
          }}
        />
      )}
      <span className="max-w-[120px] truncate">{label || status}</span>
    </span>
  );
};

export default StatusBadge;
