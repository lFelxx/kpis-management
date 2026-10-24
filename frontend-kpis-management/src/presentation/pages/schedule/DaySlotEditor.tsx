import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { ScheduleSlot, ScheduleSlotUpdateRequest, DAY_LABELS_FULL } from '../../../core/domain/Schedule/Schedule';
import { TimePicker } from '../../components/ui/TimePicker';

interface Props {
  slot: ScheduleSlot | null;
  isPublished: boolean;
  onClose: () => void;
  onSave: (slotId: number, req: ScheduleSlotUpdateRequest) => void;
  saving: boolean;
}

function toInput(t: string | null): string { return t ? t.slice(0, 5) : ''; }
function toApi(t: string): string | null    { return t ? t + ':00' : null; }

export function DaySlotEditor({ slot, isPublished, onClose, onSave, saving }: Props) {
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRestDay, setIsRestDay] = useState(false);

  useEffect(() => {
    if (slot) {
      setNotes(slot.notes ?? '');
      setStartTime(toInput(slot.startTime));
      setEndTime(toInput(slot.endTime));
      setIsRestDay(slot.isRestDay);
    }
  }, [slot]);

  if (!slot) return null;

  const handleSave = () => {
    onSave(slot.id, {
      startTime: isRestDay ? null : toApi(startTime),
      endTime:   isRestDay ? null : toApi(endTime),
      isRestDay,
      notes: notes || null,
    });
  };

  return (
    <AnimatePresence>
      {slot && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.18 }}
            className="w-full max-w-xs rounded-[22px] p-5 shadow-2xl"
            style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5" style={{ color: 'var(--t-micro)' }}>
                  {DAY_LABELS_FULL[slot.dayOfWeek]}
                </p>
                <h3 className="text-sm font-bold" style={{ color: 'var(--t-primary)' }}>{slot.adviserName}</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/8 cursor-pointer transition-colors">
                <FiX size={16} />
              </button>
            </div>

            {isPublished ? (
              <p className="text-xs text-amber-500 mb-3">Solo lectura · horario publicado</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <TimePicker label="Entrada" value={startTime} onChange={setStartTime} />
                  <TimePicker label="Salida" value={endTime} onChange={setEndTime} />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--t-micro)' }}>Notas</label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional…"
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ background: 'var(--s-subtle)', borderColor: 'var(--b-subtle)', color: 'var(--t-primary)' }} />
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={onClose} className="flex-1 btn-glass text-sm py-2 cursor-pointer">Cancelar</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary text-sm py-2 cursor-pointer disabled:opacity-60">
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
