import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send, Paperclip, Mic, X, Image as ImageIcon, Zap } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string, files: File[]) => void;
  disabled?: boolean;
  isGenerating?: boolean;
  initialText?: string;
  onTextChange?: (text: string) => void;
  onOpenTools?: () => void;
}

export const ChatInputGemini = ({
  onSend,
  disabled,
  isGenerating,
  initialText,
  onTextChange,
  onOpenTools,
}: ChatInputProps) => {
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialText !== undefined) {
      setText(initialText);
    }
  }, [initialText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (onTextChange) onTextChange(newText);
  };

  const handleSend = () => {
    if (
      (!text.trim() && selectedFiles.length === 0) ||
      isGenerating ||
      disabled
    )
      return;

    onSend(text, selectedFiles);
    setText('');
    if (onTextChange) onTextChange('');
    setSelectedFiles([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isGenerating) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles((prev) => [
        ...prev,
        ...Array.from(e.dataTransfer.files),
      ]);
    }
  };

  return (
    <div className="w-full from-slate-700  p-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* 🌟 วนลูปแสดง File Preview ทั้งหมด */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-700 p-2 rounded-lg w-fit border border-slate-600 animate-fadeIn"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon size={16} className="text-blue-400" />
                ) : (
                  <Paperclip size={16} className="text-slate-400" />
                )}
                <span className="text-sm text-slate-200 truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(idx)}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                  disabled={isGenerating || disabled}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex items-end gap-2 rounded-3xl p-2 px-4 shadow-sm transition-all
            ${isDragging ? 'bg-slate-800 border-2 border-dashed border-blue-500' : 'bg-slate-900 border border-slate-700'}
            ${isGenerating || disabled ? 'opacity-70' : !isDragging && 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'}
          `}
        >
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-3xl">
              <span className="text-blue-400 font-medium pointer-events-none flex items-center gap-2">
                <Paperclip size={18} /> วางไฟล์ที่นี่เพื่อแนบ
              </span>
            </div>
          )}

          <button
            onClick={onOpenTools}
            disabled={isGenerating || disabled}
            className="p-2 text-slate-400 hover:bg-slate-800 hover:text-blue-400 rounded-full transition-colors disabled:opacity-50"
            title="เครื่องมือ (Tools)"
          >
            <Zap size={20} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating || disabled}
            className="p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-full transition-colors disabled:opacity-50"
            title="แนบไฟล์"
          >
            <Paperclip size={20} />
          </button>
          {/* 🌟 เพิ่ม multiple ให้กับ input type="file" */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <TextareaAutosize
            minRows={1}
            maxRows={6}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isGenerating
                ? 'Generating response... '
                : disabled
                  ? "Haven't connected the model yet..."
                  : 'Type a message or drop a file here...'
            }
            disabled={isGenerating || disabled}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-slate-200 placeholder-slate-500 disabled:opacity-50"
          />

          <div className="flex items-center gap-1 pb-1">
            <button
              disabled={isGenerating || disabled}
              className="p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-full transition-colors disabled:opacity-50"
              title="ใช้เสียงพูด"
            >
              <Mic size={20} />
            </button>
            <button
              onClick={handleSend}
              disabled={
                (!text.trim() && selectedFiles.length === 0) ||
                isGenerating ||
                disabled
              }
              className={`p-2 rounded-full transition-colors z-20 ${
                text.trim() || selectedFiles.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-md'
                  : 'bg-transparent text-slate-600'
              }`}
            >
              <Send
                size={18}
                className={
                  text.trim() || selectedFiles.length > 0 ? 'ml-0.5' : ''
                }
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
