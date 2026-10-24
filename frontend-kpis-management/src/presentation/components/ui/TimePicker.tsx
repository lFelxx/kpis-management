import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiChevronDown, FiClock, FiEdit2 } from 'react-icons/fi';

const DROPDOWN_WIDTH = 140;
const DROPDOWN_HEIGHT = 270;
const LIST_MAX_HEIGHT = 220;
const DROPDOWN_GAP = 6;
const VIEWPORT_MARGIN = 8;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function splitTime(value: string): { hour: number; minute: number } | null {
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
}

function formatTime(value: string): string {
  const time = splitTime(value);
  if (!time) return '';
  return `${time.hour % 12 || 12}:${pad(time.minute)} ${time.hour < 12 ? 'am' : 'pm'}`;
}

/**
 * Acepta "8", "830", "8:30", "0830", "8.30", "8pm", "8:30 pm", "14:05".
 * Devuelve "HH:MM" en 24h o null si no es una hora válida.
 */
export function parseTimeInput(raw: string): string | null {
  const text = raw.trim().toLowerCase().replace(/\s+/g, '');
  const match = text.match(/^(\d{1,2})(?:[:.]?(\d{2}))?(?:([ap])\.?(?:m\.?)?)?$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3];

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (meridiem === 'p' ? 12 : 0);
  }
  if (hour > 23 || minute > 59) return null;
  return `${pad(hour)}:${pad(minute)}`;
}

/** Lista "HH:MM" cada `step` minutos, más el valor actual si cae fuera (ej. una hora personalizada 08:25). */
function buildOptions(minHour: number, maxHour: number, step: number, current: string): string[] {
  const options: string[] = [];
  for (let hour = minHour; hour <= maxHour; hour++) {
    for (let minute = 0; minute < 60; minute += step) options.push(`${pad(hour)}:${pad(minute)}`);
  }
  if (!current || options.includes(current)) return options;
  return [...options, current].sort();
}

interface TimePickerProps {
  /** "HH:MM" en 24h, o '' si no hay hora. */
  value: string;
  onChange: (value: string) => void;
  label: string;
  accentColor?: string;
  minuteStep?: number;
  minHour?: number;
  maxHour?: number;
}

export function TimePicker({
  value,
  onChange,
  label,
  accentColor = '#10b981',
  minuteStep = 10,
  minHour = 6,
  maxHour = 23,
}: TimePickerProps) {
  const reduceMotion = useReducedMotion();
  const labelId = useId();

  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [invalid, setInvalid] = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editingRef = useRef(false);

  const parsedValue = splitTime(value);
  const normalizedValue = parsedValue ? `${pad(parsedValue.hour)}:${pad(parsedValue.minute)}` : '';
  const options = buildOptions(minHour, maxHour, minuteStep, normalizedValue);

  // Centra la hora seleccionada al abrir
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>('[data-selected="true"]');
    if (list && selected) {
      list.scrollTop = selected.offsetTop - list.clientHeight / 2 + selected.offsetHeight / 2;
    }
  }, [open]);

  // Cierra con clic fuera, Escape, scroll de la página o resize
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!btnRef.current?.contains(target) && !dropRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = (e: Event) => {
      if (!dropRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const close = () => setOpen(false);

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const fitsBelow = window.innerHeight - r.bottom >= DROPDOWN_HEIGHT + DROPDOWN_GAP + VIEWPORT_MARGIN;
      const top = fitsBelow ? r.bottom + DROPDOWN_GAP : Math.max(VIEWPORT_MARGIN, r.top - DROPDOWN_HEIGHT - DROPDOWN_GAP);
      const left = Math.min(r.left, window.innerWidth - DROPDOWN_WIDTH - VIEWPORT_MARGIN);
      setDropPos({ top, left: Math.max(VIEWPORT_MARGIN, left) });
    }
    setOpen(o => !o);
  };

  const startEditing = () => {
    editingRef.current = true;
    setDraft(formatTime(value));
    setInvalid(false);
    setOpen(false);
    setEditing(true);
  };

  const finishEditing = (apply: boolean) => {
    if (!editingRef.current) return;
    editingRef.current = false;
    if (apply) {
      const parsed = parseTimeInput(draft);
      if (parsed) onChange(parsed);
    }
    setEditing(false);
    setInvalid(false);
  };

  const pickOption = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const dropdown = createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropRef}
          role="dialog"
          aria-label={`Elegir ${label.toLowerCase()}`}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
          style={{
            position: 'fixed',
            top: dropPos.top,
            left: dropPos.left,
            width: DROPDOWN_WIDTH,
            zIndex: 9999,
            background: 'var(--s-card)',
            border: '1px solid var(--b-line)',
            backdropFilter: 'blur(20px)',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            overflow: 'hidden',
          }}>
          <div ref={listRef} className="overflow-y-auto py-1.5" style={{ maxHeight: LIST_MAX_HEIGHT }}>
            {options.map(option => {
              const selected = option === normalizedValue;
              return (
                <button key={option} type="button" data-selected={selected}
                  onClick={() => pickOption(option)}
                  className={`w-full flex items-center justify-between px-3.5 py-1.5 text-[12px] font-mono cursor-pointer transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-inset ${
                    selected ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={{
                    background: selected ? `${accentColor}20` : 'transparent',
                    color: selected ? accentColor : 'var(--t-secondary)',
                    fontWeight: selected ? 700 : 400,
                    ['--tw-ring-color' as string]: accentColor,
                  }}>
                  <span>{formatTime(option)}</span>
                  {selected && <span className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />}
                </button>
              );
            })}
          </div>

          <button type="button" onClick={startEditing}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/5 outline-none focus-visible:ring-2 focus-visible:ring-inset"
            style={{ borderTop: '1px solid var(--b-line)', color: accentColor, ['--tw-ring-color' as string]: accentColor }}>
            <FiEdit2 size={11} /> Escribir hora
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label id={labelId} className="text-[9px] font-bold uppercase tracking-[0.22em] flex items-center gap-1"
        style={{ color: 'var(--t-micro)' }}>
        <FiClock size={9} /> {label}
      </label>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          aria-labelledby={labelId}
          aria-invalid={invalid}
          placeholder="8:30 am"
          onChange={e => { setDraft(e.target.value); setInvalid(false); }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (parseTimeInput(draft)) finishEditing(true);
              else setInvalid(true);
            }
            if (e.key === 'Escape') { e.stopPropagation(); finishEditing(false); }
          }}
          onBlur={() => finishEditing(true)}
          className="w-full min-w-[100px] px-3 py-2 rounded-xl border text-[13px] font-mono font-semibold focus:outline-none transition-all duration-150"
          style={{
            background: `${invalid ? '#ef4444' : accentColor}12`,
            borderColor: `${invalid ? '#ef4444' : accentColor}60`,
            color: 'var(--t-primary)',
            boxShadow: `0 0 0 3px ${invalid ? '#ef4444' : accentColor}15`,
          }}
        />
      ) : (
        <button
          ref={btnRef}
          type="button"
          aria-labelledby={labelId}
          aria-haspopup="dialog"
          aria-expanded={open}
          title="Clic para elegir · doble clic para escribir una hora"
          onClick={toggleOpen}
          onDoubleClick={startEditing}
          className="w-full min-w-[100px] flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-[13px] font-mono font-semibold cursor-pointer transition-all duration-150 outline-none focus-visible:ring-2"
          style={{
            background: open ? `${accentColor}12` : 'var(--s-subtle)',
            borderColor: open ? `${accentColor}60` : 'var(--b-subtle)',
            color: value ? 'var(--t-primary)' : 'var(--t-muted)',
            boxShadow: open ? `0 0 0 3px ${accentColor}15` : 'none',
            ['--tw-ring-color' as string]: accentColor,
          }}>
          <span>{value ? formatTime(value) : '—'}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.15 }}>
            <FiChevronDown size={12} style={{ color: 'var(--t-micro)' }} />
          </motion.div>
        </button>
      )}

      {invalid && (
        <span className="text-[10px]" style={{ color: '#ef4444' }}>Prueba con 8:30, 0830 o 8:30 pm</span>
      )}

      {dropdown}
    </div>
  );
}
