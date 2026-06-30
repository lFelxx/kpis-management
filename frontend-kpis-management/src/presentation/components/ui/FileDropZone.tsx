import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import { EMERALD, CYAN } from '../../lib/colors';

interface FileDropZoneProps {
  accept: string;
  acceptLabel: string;
  onFile: (file: File) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

type DropZoneState = 'idle' | 'dragging' | 'selected' | 'loading';

function resolveDropZoneState(
  isDragging: boolean,
  hasFile: boolean,
  isLoading: boolean
): DropZoneState {
  if (isLoading) return 'loading';
  if (isDragging) return 'dragging';
  if (hasFile) return 'selected';
  return 'idle';
}

function DropZoneIcon({ state }: { state: DropZoneState }) {
  const iconStyle = { color: state === 'idle' || state === 'selected' ? 'var(--t-muted)' : EMERALD };

  return (
    <motion.div
      animate={state === 'dragging' ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="w-14 h-14 rounded-2xl flex items-center justify-center"
      style={{
        background: state === 'dragging' ? `${EMERALD}20` : 'var(--s-card)',
        border: `1px solid ${state === 'dragging' ? `${EMERALD}40` : 'var(--b-subtle)'}`,
      }}
    >
      {state === 'loading' && <LoadingSpinner />}
      {state === 'selected' && <FaCheckCircle size={22} style={{ color: EMERALD }} />}
      {state === 'dragging' && <FaUpload size={22} style={iconStyle} />}
      {state === 'idle' && <FaFileAlt size={22} style={iconStyle} />}
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <div
      className="w-6 h-6 rounded-full border-2 animate-spin"
      style={{ borderColor: `${EMERALD} transparent transparent transparent` }}
    />
  );
}

function DropZoneLabel({ state, fileName, acceptLabel }: {
  state: DropZoneState;
  fileName: string | null;
  acceptLabel: string;
}) {
  const labelByState: Record<DropZoneState, string> = {
    loading: 'Procesando...',
    dragging: 'Suelta para cargar',
    selected: fileName ?? '',
    idle: 'Arrastra tu archivo aquí',
  };

  const labelColor =
    state === 'loading' || state === 'dragging' ? EMERALD : 'var(--t-primary)';

  return (
    <div className="text-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-sm font-bold truncate max-w-[220px]"
          style={{ color: labelColor }}
        >
          {labelByState[state]}
        </motion.p>
      </AnimatePresence>

      {state === 'idle' && (
        <p className="text-xs mt-1" style={{ color: 'var(--t-micro)' }}>
          o haz clic para seleccionar · {acceptLabel}
        </p>
      )}
    </div>
  );
}

function DragActiveGlow() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 rounded-3xl pointer-events-none"
      style={{ boxShadow: `inset 0 0 0 2px ${EMERALD}60` }}
    />
  );
}

export function FileDropZone({
  accept,
  acceptLabel,
  onFile,
  loading = false,
  disabled = false,
  className = '',
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const isInteractive = !disabled && !loading;
  const state = resolveDropZoneState(isDragging, !!selectedFileName, loading);

  const processFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setSelectedFileName(file.name);
      onFile(file);
    },
    [onFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isInteractive) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isInteractive) processFile(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleClick = () => {
    if (isInteractive) inputRef.current?.click();
  };

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      animate={isDragging ? { scale: 1.015 } : { scale: 1 }}
      transition={{ duration: 0.15 }}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-3xl px-8 py-10 select-none ${className}`}
      style={{
        background: isDragging
          ? `linear-gradient(135deg, ${EMERALD}18, ${CYAN}12)`
          : 'var(--s-subtle)',
        border: `2px dashed ${isDragging ? EMERALD : 'var(--b-line)'}`,
        boxShadow: isDragging ? `0 0 32px ${EMERALD}25` : 'none',
        opacity: disabled ? 0.5 : 1,
        cursor: isInteractive ? 'pointer' : 'not-allowed',
      }}
    >
      <AnimatePresence>
        {isDragging && <DragActiveGlow />}
      </AnimatePresence>

      <DropZoneIcon state={state} />

      <DropZoneLabel
        state={state}
        fileName={selectedFileName}
        acceptLabel={acceptLabel}
      />

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={!isInteractive}
      />
    </motion.div>
  );
}
