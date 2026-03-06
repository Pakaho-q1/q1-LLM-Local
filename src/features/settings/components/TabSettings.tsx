import React, { useState } from 'react';
import { useSettings as useSettingsContext } from '@/contexts/SettingsContext';
import { useSettings as usePresetLogic } from '../hooks/useSettings';
import { Tooltip } from '@/components/ui/Tooltip';
import { Combobox } from '@/components/ui/Combobox';
import { Modal } from '@/components/ui/Modal';
import { X, Save, Trash2, RefreshCw, RotateCcw } from 'lucide-react';

interface SettingSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  tooltip?: string;
}

const SettingSlider: React.FC<SettingSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  tooltip,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginBottom: 14,
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {tooltip ? (
        <Tooltip content={tooltip} position="right">
          <label
            style={{
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              borderBottom: '1px dotted var(--border-strong)',
              cursor: 'help',
            }}
          >
            {label}
          </label>
        </Tooltip>
      ) : (
        <label
          style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          width: 64,
          textAlign: 'right',
          fontSize: '0.78rem',
          padding: '3px 8px',
          borderRadius: 6,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
    <div
      style={{
        position: 'relative',
        height: 20,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: 4,
          borderRadius: 4,
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((value - min) / (max - min)) * 100}%, var(--border-strong) ${((value - min) / (max - min)) * 100}%, var(--border-strong) 100%)`,
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: 'pointer',
          outline: 'none',
          accentColor: 'var(--accent)',
        }}
      />
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section
    style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '14px 16px',
      marginBottom: 12,
    }}
  >
    <h3
      style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--text-tertiary)',
        marginBottom: 14,
      }}
    >
      {title}
    </h3>
    {children}
  </section>
);

export const TabSettings: React.FC = () => {
  const { settings, updateSetting } = useSettingsContext();
  const {
    presets,
    selectedPresetName,
    error,
    loadPreset,
    createPreset,
    updatePreset,
    deletePreset,
    clearError,
  } = usePresetLogic();
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedDropdown, setSelectedDropdown] = useState('');
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);
  const [presetToUpdate, setPresetToUpdate] = useState<string | null>(null);

  return (
    <div style={{ paddingBottom: 40 }}>
      {error && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 12,
            background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
            border:
              '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
            color: 'var(--danger)',
            fontSize: '0.83rem',
            animation: 'fadeIn 0.2s both',
          }}
        >
          <span>{error}</span>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--danger)',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Preset Manager */}
      <Section title="Presets">
        <div style={{ marginBottom: 10 }}>
          <Combobox
            className="w-full"
            options={presets.map((p) => ({
              value: p.name,
              label: (
                <span
                  style={{ fontSize: '0.83rem', color: 'var(--text-primary)' }}
                >
                  {p.name}
                </span>
              ),
            }))}
            value={selectedDropdown}
            onChange={setSelectedDropdown}
            placeholder="Search presets…"
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[
            {
              label: 'Load',
              action: () => selectedDropdown && loadPreset(selectedDropdown),
              variant: 'success' as const,
            },
            {
              label: 'Update',
              action: () => setPresetToUpdate(selectedDropdown),
              variant: 'primary' as const,
            },
            {
              label: 'Delete',
              action: () => setPresetToDelete(selectedDropdown),
              variant: 'danger' as const,
            },
          ].map(({ label, action, variant }) => {
            const colors = {
              success: 'var(--success)',
              primary: 'var(--accent)',
              danger: 'var(--danger)',
            };
            return (
              <button
                key={label}
                onClick={action}
                disabled={!selectedDropdown}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: `1px solid color-mix(in srgb, ${colors[variant]} 35%, transparent)`,
                  background: `color-mix(in srgb, ${colors[variant]} 10%, transparent)`,
                  color: colors[variant],
                  cursor: !selectedDropdown ? 'not-allowed' : 'pointer',
                  opacity: !selectedDropdown ? 0.4 : 1,
                  transition: 'all 0.14s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="New preset name…"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              newPresetName.trim() &&
              (createPreset(newPresetName, ''), setNewPresetName(''))
            }
            style={{ flex: 1, padding: '7px 12px', fontSize: '0.8rem' }}
          />
          <button
            onClick={() => {
              if (newPresetName.trim()) {
                createPreset(newPresetName, '');
                setNewPresetName('');
              }
            }}
            disabled={!newPresetName.trim()}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              cursor: !newPresetName.trim() ? 'not-allowed' : 'pointer',
              opacity: !newPresetName.trim() ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Save size={12} /> Save
          </button>
        </div>
      </Section>

      <Modal
        isOpen={!!presetToDelete}
        onClose={() => setPresetToDelete(null)}
        onConfirm={async () => {
          if (presetToDelete) {
            await deletePreset(presetToDelete);
            setPresetToDelete(null);
          }
        }}
        title="Delete Preset"
        confirmText="Delete"
        confirmVariant="danger"
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Delete preset{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            "{presetToDelete}"
          </strong>
          ?
        </p>
      </Modal>
      <Modal
        isOpen={!!presetToUpdate}
        onClose={() => setPresetToUpdate(null)}
        onConfirm={async () => {
          if (presetToUpdate) {
            await updatePreset(presetToUpdate, '');
            setPresetToUpdate(null);
          }
        }}
        title="Update Preset"
        confirmText="Update"
        confirmVariant="primary"
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Update{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            "{presetToUpdate}"
          </strong>{' '}
          with current settings?
        </p>
      </Modal>

      {/* System Prompt */}
      <Section title="System Prompt">
        <textarea
          value={settings.systemPrompt}
          onChange={(e) => updateSetting('systemPrompt', e.target.value)}
          rows={4}
          style={{
            width: '100%',
            resize: 'vertical',
            fontSize: '0.83rem',
            padding: '10px 12px',
            borderRadius: 8,
            minHeight: 90,
          }}
          className="custom-scrollbar"
        />
      </Section>

      {/* Basic Sampling */}
      <Section title="Sampling">
        <SettingSlider
          label="Temperature"
          value={settings.temperature}
          min={0}
          max={2}
          step={0.05}
          onChange={(v) => updateSetting('temperature', v)}
          tooltip="Randomness: lower=focused, higher=creative"
        />
        <SettingSlider
          label="Max Tokens"
          value={settings.maxTokens}
          min={128}
          max={8192}
          step={128}
          onChange={(v) => updateSetting('maxTokens', v)}
          tooltip="Maximum tokens to generate per response"
        />
        <SettingSlider
          label="Top P"
          value={settings.topP}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => updateSetting('topP', v)}
          tooltip="Nucleus sampling threshold"
        />
        <SettingSlider
          label="Top K"
          value={settings.topK}
          min={0}
          max={100}
          step={1}
          onChange={(v) => updateSetting('topK', v)}
          tooltip="Limit vocabulary to top K tokens"
        />
      </Section>

      {/* Penalties */}
      <Section title="Penalties">
        <SettingSlider
          label="Min P"
          value={settings.minP}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => updateSetting('minP', v)}
          tooltip="Minimum probability relative to top token"
        />
        <SettingSlider
          label="Repeat Penalty"
          value={settings.repeatPenalty}
          min={1}
          max={2}
          step={0.05}
          onChange={(v) => updateSetting('repeatPenalty', v)}
          tooltip="Discourage repeating same phrases"
        />
        <SettingSlider
          label="Presence Penalty"
          value={settings.presencePenalty}
          min={-2}
          max={2}
          step={0.1}
          onChange={(v) => updateSetting('presencePenalty', v)}
          tooltip="Encourage talking about new topics"
        />
        <SettingSlider
          label="Frequency Penalty"
          value={settings.frequencyPenalty}
          min={-2}
          max={2}
          step={0.1}
          onChange={(v) => updateSetting('frequencyPenalty', v)}
          tooltip="Reduce repetition by frequency"
        />
      </Section>

      {/* Hardware */}
      <Section title="Hardware (Requires Reload)">
        <p
          style={{
            fontSize: '0.76rem',
            color: 'var(--text-tertiary)',
            marginBottom: 12,
            marginTop: -6,
          }}
        >
          Changes take effect after model reload.
        </p>
        <SettingSlider
          label="Context Size (n_ctx)"
          value={settings.nCtx}
          min={512}
          max={32768}
          step={512}
          onChange={(v) => updateSetting('nCtx', v)}
          tooltip="Max tokens the model can remember (affects VRAM)"
        />
        <SettingSlider
          label="GPU Layers (-1 = All)"
          value={settings.nGpuLayers}
          min={-1}
          max={100}
          step={1}
          onChange={(v) => updateSetting('nGpuLayers', v)}
          tooltip="Layers to offload to GPU (-1 = all)"
        />
        <SettingSlider
          label="CPU Threads"
          value={settings.nThreads}
          min={1}
          max={32}
          step={1}
          onChange={(v) => updateSetting('nThreads', v)}
          tooltip="Number of CPU threads for generation"
        />
        <SettingSlider
          label="Batch Size (n_batch)"
          value={settings.nBatch}
          min={128}
          max={2048}
          step={128}
          onChange={(v) => updateSetting('nBatch', v)}
          tooltip="Tokens to process in parallel"
        />
      </Section>
    </div>
  );
};
