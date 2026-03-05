import React, { useState } from 'react';
import { useSettings as useSettingsContext } from '../../../contexts/SettingsContext';
import { useSettings as usePresetLogic } from '../hooks/useSettings';
import { Tooltip } from '../../../components/ui/Tooltip';
import { Combobox } from '../../../components/ui/Combobox';
import { Modal } from '../../../components/ui/Modal';

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
  <div className="flex flex-col gap-1.5 mb-3">
    <div className="flex justify-between items-center">
      {/* 2. 🟢 ถ้ามีส่ง tooltip มา ให้เอา Tooltip มาครอบ Label */}
      {tooltip ? (
        <Tooltip content={tooltip} position="right">
          <label className="text-xs font-medium text-slate-300 border-b border-dotted border-neutral-400 cursor-help">
            {label}
          </label>
        </Tooltip>
      ) : (
        <label className="text-xs font-medium text-slate-300">{label}</label>
      )}

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-16 text-right text-xs text-black bg-neutral-100/50  rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-neutral-200/50 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
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

  const handleLoadPreset = async () => {
    if (selectedDropdown) {
      await loadPreset(selectedDropdown);
    }
  };

  const handleCreatePreset = async () => {
    if (!newPresetName.trim()) return;
    await createPreset(newPresetName, '');
    setNewPresetName('');
  };

  const handleDeletePreset = async () => {
    if (presetToDelete) {
      await deletePreset(presetToDelete);
      setPresetToDelete(null);
    }
  };

  const handleUpdatePreset = async () => {
    if (presetToUpdate) {
      await updatePreset(presetToUpdate, '');
      setPresetToUpdate(null);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 text-sm rounded-lg flex justify-between items-center">
          <span>❌ {error}</span>
          <button
            onClick={clearError}
            className="text-red-300 hover:text-red-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 💾 Preset Manager */}
      <section className="flex flex-col  bg-slate-800 p-4 rounded-lg text-slate-200 rounded-xl border border-neutral-200/20 p-2 shadow-sm space-y-1">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
          💾 Preset Manager
        </h3>

        {/* 🔹 เลือก preset */}
        <div className="mb-3 text-neutral-50 ">
          <Combobox
            options={presets.map((p) => ({
              value: p.name,
              label: (
                <span
                  className="font-semibold text-gray-700 text-sm truncate"
                  title={p.name}
                >
                  {p.name}
                </span>
              ),
            }))}
            value={selectedDropdown}
            onChange={setSelectedDropdown}
            placeholder="ค้นหา Preset..."
          />
        </div>

        {/* 🔹 ปุ่มจัดการ */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleLoadPreset}
            disabled={!selectedDropdown}
            className="bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-100 disabled:opacity-50"
          >
            Load
          </button>

          {/* 🟢 เปลี่ยนเป็น setPresetToDelete */}
          <button
            onClick={() => setPresetToDelete(selectedDropdown)}
            disabled={!selectedDropdown}
            className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
          >
            Delete
          </button>

          {/* 🟢 เปลี่ยนเป็น setPresetToUpdate */}
          <button
            onClick={() => setPresetToUpdate(selectedDropdown)}
            disabled={!selectedDropdown}
            className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
          >
            Update
          </button>
        </div>

        {/* 🔹 สร้าง preset ใหม่ */}
        <div className="flex gap-2 text-slate-300">
          <input
            type="text"
            placeholder="New Preset Name..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="flex-1 text-sm px-3 py-1.5 border border-gray-400 rounded-lg outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCreatePreset}
            disabled={!newPresetName.trim()}
            className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </section>

      {/* ========================================== */}
      {/* 🟢 Confirmation Modals */}
      {/* ========================================== */}

      {/* Modal สำหรับการลบ Preset */}
      <Modal
        isOpen={!!presetToDelete}
        onClose={() => setPresetToDelete(null)}
        onConfirm={handleDeletePreset}
        title="Delete Preset"
        confirmText="Delete"
        confirmVariant="danger"
      >
        <p>
          Are you sure you want to delete the preset{' '}
          <span className="font-bold text-neutral-800">"{presetToDelete}"</span>
          ?
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          This will remove these saved settings from the database.
        </p>
      </Modal>

      {/* Modal สำหรับการอัปเดต Preset */}
      <Modal
        isOpen={!!presetToUpdate}
        onClose={() => setPresetToUpdate(null)}
        onConfirm={handleUpdatePreset}
        title="Update Preset"
        confirmText="Update"
        confirmVariant="primary"
      >
        <p>
          Update{' '}
          <span className="font-bold text-neutral-800">"{presetToUpdate}"</span>{' '}
          with your current settings?
        </p>
        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100 text-[11px] text-blue-700">
          Current parameters (Temp: {settings.temperature}, Context:{' '}
          {settings.nCtx}...) will be saved.
        </div>
      </Modal>

      {/* 🧠 System Prompt */}
      <section className="flex flex-col  bg-slate-800 p-4 rounded-lg text-slate-200 rounded-xl border border-neutral-200/20 p-2 shadow-sm space-y-1">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
          🧠 System Prompt
        </h3>
        <p className="text-xs text-slate-300 mb-2">
          Define the system prompt applied when creating or sending messages.
        </p>
        <textarea
          value={settings.systemPrompt}
          onChange={(e) => updateSetting('systemPrompt', e.target.value)}
          className="w-full h-28 p-2 text-sm rounded  bg-white/70 text-neutral-900 outline-none resize-vertical custom-scrollbar"
        />
      </section>

      {/* ⚡ Basic Sampling */}
      <section className="flex flex-col  bg-slate-800 p-4 rounded-lg text-slate-200 rounded-xl border border-neutral-200/20 p-2 shadow-sm space-y-1">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
          ⚡ Basic Sampling
        </h3>

        <SettingSlider
          label="Temperature"
          value={settings.temperature}
          min={0}
          max={2}
          step={0.05}
          onChange={(v: number) => updateSetting('temperature', v)}
          tooltip="Controls randomness: Lower is focused/deterministic, higher is creative/varied."
        />
        <SettingSlider
          label="Max Tokens"
          value={settings.maxTokens}
          min={128}
          max={8192}
          step={128}
          onChange={(v: number) => updateSetting('maxTokens', v)}
          tooltip="The maximum number of tokens the model can generate in a single response."
        />
        <SettingSlider
          label="Top P "
          value={settings.topP}
          min={0}
          max={1}
          step={0.05}
          onChange={(v: number) => updateSetting('topP', v)}
          tooltip="Nucleus sampling: Only considers tokens with a cumulative probability up to P."
        />
        <SettingSlider
          label="Top K"
          value={settings.topK}
          min={0}
          max={100}
          step={1}
          onChange={(v: number) => updateSetting('topK', v)}
          tooltip="Limits the vocabulary to the top K most likely next tokens."
        />
      </section>

      {/* 🎛️ Advanced Penalties */}
      <section className="flex flex-col  bg-slate-800 p-4 rounded-lg text-slate-200 rounded-xl border border-neutral-200/20 p-2 shadow-sm space-y-1">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
          🎛️ Advanced Penalties
        </h3>

        <SettingSlider
          label="Min P"
          value={settings.minP}
          min={0}
          max={1}
          step={0.05}
          onChange={(v: number) => updateSetting('minP', v)}
          tooltip="Alternative to Top-P: Minimum probability relative to the most likely token."
        />
        <SettingSlider
          label="Repeat Penalty"
          value={settings.repeatPenalty}
          min={1}
          max={2}
          step={0.05}
          onChange={(v: number) => updateSetting('repeatPenalty', v)}
          tooltip="Discourages the model from repeating the same lines or phrases."
        />
        <SettingSlider
          label="Presence Penalty"
          value={settings.presencePenalty}
          min={-2}
          max={2}
          step={0.1}
          onChange={(v: number) => updateSetting('presencePenalty', v)}
          tooltip="Encourages the model to talk about new topics (based on presence)."
        />
        <SettingSlider
          label="Frequency Penalty"
          value={settings.frequencyPenalty}
          min={-2}
          max={2}
          step={0.1}
          onChange={(v: number) => updateSetting('frequencyPenalty', v)}
          tooltip="Reduces repetition by penalizing tokens based on their frequency so far."
        />
      </section>

      {/* 🖥️ Hardware & Context */}
      <section className="flex flex-col  bg-slate-800 p-4 rounded-lg text-slate-200 rounded-xl border border-neutral-200/20 p-2 shadow-sm space-y-1">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-1">
          🖥️ Hardware (Requires Reload)
        </h3>
        <p className="text-xs text-slate-300 mb-3">
          Changes take effect after model reload.
        </p>

        <SettingSlider
          label="Context Size (n_ctx)"
          value={settings.nCtx}
          min={512}
          max={32768}
          step={512}
          onChange={(v: number) => updateSetting('nCtx', v)}
          tooltip="Maximum sequence length the model can remember (affects VRAM usage)."
        />
        <SettingSlider
          label="GPU Layers (-1 = All)"
          value={settings.nGpuLayers}
          min={-1}
          max={100}
          step={1}
          onChange={(v: number) => updateSetting('nGpuLayers', v)}
          tooltip="Number of layers to offload to GPU. Set to -1 to offload all layers."
        />
        <SettingSlider
          label="CPU Threads"
          value={settings.nThreads}
          min={1}
          max={32}
          step={1}
          onChange={(v: number) => updateSetting('nThreads', v)}
          tooltip="Number of CPU threads to use for generation (match your CPU cores)."
        />
        <SettingSlider
          label="Batch Size (n_batch)"
          value={settings.nBatch}
          min={128}
          max={2048}
          step={128}
          onChange={(v: number) => updateSetting('nBatch', v)}
          tooltip="Number of tokens to process in parallel during prompt ingestion."
        />
      </section>
    </div>
  );
};
