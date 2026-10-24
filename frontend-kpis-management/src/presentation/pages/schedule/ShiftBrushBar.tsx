import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { ShiftTemplate } from '../../../core/domain/Schedule/ShiftTemplate';
import { useShiftTemplateStore } from '../../stores/schedule/shiftTemplate.store';
import { TimePicker } from '../../components/ui/TimePicker';

export interface Brush {
  id: string;
  name: string;
  start: string;
  end: string;
  color: string;
  isRest: boolean;
  hasLunch: boolean;
}

export function templateToBrush(t: ShiftTemplate): Brush {
  return {
    id: String(t.id),
    name: t.name,
    start: t.startTime ?? '',
    end: t.endTime ?? '',
    color: t.color,
    isRest: t.isRest,
    hasLunch: t.hasLunch ?? false,
  };
}

const PALETTE = [
  '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b',
  '#ef4444', '#ec4899', '#3b82f6', '#6b7280',
];

// ── Main component ────────────────────────────────────────────────────────────
interface EditState {
  name: string;
  start: string;
  end: string;
  color: string;
  isRest: boolean;
  noHours: boolean;
  hasLunch: boolean;
}

const EMPTY_EDIT: EditState = { name: '', start: '08:00', end: '17:00', color: '#10b981', isRest: false, noHours: false, hasLunch: false };

interface Props {
  activeBrushId: string | null;
  onSelectBrush: (id: string | null) => void;
  showShiftNames: boolean;
  onToggleShiftNames: () => void;
}

export function ShiftBrushBar({ activeBrushId, onSelectBrush, showShiftNames, onToggleShiftNames }: Props) {
  const { templates, loading, saving, fetchAll, create, update, remove } = useShiftTemplateStore();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [form, setForm]             = useState<EditState>(EMPTY_EDIT);

  useEffect(() => { fetchAll(); }, []);

  const hasNoHours = (f: EditState) => f.isRest || f.noHours;

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    const t = await create({
      name: form.name.trim(),
      startTime: hasNoHours(form) ? null : (form.start || null),
      endTime:   hasNoHours(form) ? null : (form.end   || null),
      color:    form.color,
      isRest:   form.isRest,
      hasLunch: form.hasLunch,
    });
    setShowCreate(false);
    setForm(EMPTY_EDIT);
    onSelectBrush(String(t.id));
  };

  const startEdit = (t: ShiftTemplate) => {
    setEditingId(t.id);
    setForm({
      name:     t.name,
      start:    t.startTime ?? '08:00',
      end:      t.endTime   ?? '17:00',
      color:    t.color,
      isRest:   t.isRest,
      noHours:  !t.isRest && !t.startTime,
      hasLunch: t.hasLunch ?? false,
    });
    setShowCreate(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name.trim()) return;
    await update(editingId, {
      name:      form.name.trim(),
      startTime: hasNoHours(form) ? null : (form.start || null),
      endTime:   hasNoHours(form) ? null : (form.end   || null),
      color:     form.color,
      isRest:    form.isRest,
      hasLunch:  form.hasLunch,
    });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    await remove(id);
    if (activeBrushId === String(id)) {
      const next = templates.find(t => t.id !== id);
      if (next) onSelectBrush(String(next.id));
    }
  };

  const cancelEdit = () => { setEditingId(null); setShowCreate(false); setForm(EMPTY_EDIT); };
  const formOpen = showCreate || editingId !== null;

  return (
    <div className="p-5 pb-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold tracking-[0.32em] text-emerald-500 uppercase">
          Turnos
        </span>

        {/* "Nuevo turno" — visible pill with emerald tint */}
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setShowCreate(s => !s); setEditingId(null); setForm(EMPTY_EDIT); }}
          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
          style={{
            background: showCreate
              ? 'rgba(16,185,129,0.18)'
              : 'rgba(16,185,129,0.08)',
            border: `1.5px solid ${showCreate ? 'rgba(16,185,129,0.55)' : 'rgba(16,185,129,0.25)'}`,
            color: '#10b981',
          }}>
          <motion.div animate={{ rotate: showCreate ? 45 : 0 }} transition={{ duration: 0.18 }}>
            <FiPlus size={12} />
          </motion.div>
          Nuevo turno
        </motion.button>
      </div>

      {/* ── Show/hide names toggle ── */}
      <div className="mb-3">
        <button type="button" onClick={onToggleShiftNames}
          className="relative flex items-center gap-2.5 cursor-pointer"
          style={{ outline: 'none' }}>
          <div className="relative w-9 h-5 rounded-full transition-all duration-200 shrink-0"
            style={{
              background: showShiftNames ? 'rgba(16,185,129,0.70)' : 'var(--s-subtle)',
              border: `1.5px solid ${showShiftNames ? 'rgba(16,185,129,0.55)' : 'var(--b-subtle)'}`,
            }}>
            <div className="absolute top-[2px] h-3.5 w-3.5 rounded-full transition-all duration-200"
              style={{
                left: showShiftNames ? 'calc(100% - 16px)' : '2px',
                background: showShiftNames ? 'white' : 'var(--t-muted)',
              }} />
          </div>
          <span className="text-[11px] font-semibold transition-colors duration-150"
            style={{ color: showShiftNames ? '#10b981' : 'var(--t-muted)' }}>
            Mostrar nombres de turnos
          </span>
        </button>
      </div>

      {/* ── Brush pills ── */}
      <div className="flex flex-wrap gap-2">
        {loading && templates.length === 0 && (
          <>
            {[80, 96, 88, 72].map((w, i) => (
              <div key={i} className="h-9 rounded-xl animate-pulse"
                style={{ width: w, background: 'var(--s-subtle)' }} />
            ))}
          </>
        )}

        {templates.map(t => {
          const isActive  = activeBrushId === String(t.id);
          const isEditing = editingId === t.id;
          return (
            <div key={t.id} className="relative group flex items-center gap-0.5">
              <button
                onClick={() => {
                  onSelectBrush(activeBrushId === String(t.id) ? null : String(t.id));
                  setEditingId(null);
                  setShowCreate(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 cursor-pointer"
                style={{
                  background: isActive ? `${t.color}20` : 'var(--s-subtle)',
                  border: `1.5px solid ${isActive ? t.color + '55' : 'transparent'}`,
                  color: isActive ? t.color : 'var(--t-secondary)',
                  boxShadow: isActive ? `0 0 0 3px ${t.color}15` : 'none',
                }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                {t.name}
                {!t.isRest && t.startTime && (
                  <span className="text-[10px] font-mono opacity-60">
                    {t.startTime.slice(0, 5)}–{t.endTime?.slice(0, 5)}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
                <button onClick={() => startEdit(t)}
                  className="p-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{ color: isEditing ? t.color : 'var(--t-micro)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${t.color}18`; (e.currentTarget as HTMLElement).style.color = t.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = isEditing ? t.color : 'var(--t-micro)'; }}>
                  <FiEdit2 size={10} />
                </button>
                <button onClick={() => handleDelete(t.id)} disabled={saving}
                  className="p-1.5 rounded-lg cursor-pointer hover:bg-red-500/10 transition-colors text-red-400/60 hover:text-red-400 disabled:opacity-40">
                  <FiTrash2 size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Inline form ── */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'clip' }}>

            <div className="mt-4 pt-4 border-t space-y-4" style={{ borderColor: 'var(--b-line)' }}>

              {/* Section label */}
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase"
                style={{ color: 'var(--t-micro)' }}>
                {editingId ? '✦ Editar turno' : '✦ Nuevo turno'}
              </p>

              {/* Row 1: Nombre + Tipo */}
              <div className="flex flex-wrap gap-3 items-end">
                {/* Nombre — wider */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                  <label className="text-[9px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: 'var(--t-micro)' }}>Nombre</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') editingId ? handleUpdate() : handleCreate(); }}
                    placeholder="Ej. Apertura…"
                    autoFocus
                    className="rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold focus:outline-none transition-all"
                    style={{
                      background: 'var(--s-subtle)',
                      borderColor: form.name ? form.color + '55' : 'var(--b-subtle)',
                      color: 'var(--t-primary)',
                      boxShadow: form.name ? `0 0 0 3px ${form.color}10` : 'none',
                    }}
                  />
                </div>

                {/* Tipo: Turno / Sin horas / Libre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: 'var(--t-micro)' }}>Tipo</label>
                  <div className="flex rounded-xl overflow-hidden"
                    style={{ border: '1.5px solid var(--b-subtle)' }}>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, isRest: false, noHours: false }))}
                      className="px-3.5 py-2 text-[11px] font-bold cursor-pointer transition-all duration-150"
                      style={{
                        background: !form.isRest && !form.noHours ? form.color : 'var(--s-subtle)',
                        color: !form.isRest && !form.noHours ? 'white' : 'var(--t-muted)',
                      }}>
                      Turno
                    </button>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, isRest: false, noHours: true }))}
                      className="px-3.5 py-2 text-[11px] font-bold cursor-pointer transition-all duration-150"
                      style={{
                        background: !form.isRest && form.noHours ? '#f59e0b' : 'var(--s-subtle)',
                        color: !form.isRest && form.noHours ? 'white' : 'var(--t-muted)',
                        borderLeft: '1px solid var(--b-subtle)',
                      }}>
                      Sin horas
                    </button>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, isRest: true, noHours: false }))}
                      className="px-3.5 py-2 text-[11px] font-bold cursor-pointer transition-all duration-150"
                      style={{
                        background: form.isRest ? '#6b7280' : 'var(--s-subtle)',
                        color: form.isRest ? 'white' : 'var(--t-muted)',
                        borderLeft: '1px solid var(--b-subtle)',
                      }}>
                      Libre
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Entrada + Salida (solo si tiene horas) */}
              <AnimatePresence>
                {!hasNoHours(form) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-visible">
                    <div className="flex gap-3 flex-wrap">
                      <TimePicker
                        value={form.start}
                        onChange={v => setForm(f => ({ ...f, start: v }))}
                        label="Entrada"
                        accentColor={form.color}
                      />
                      <div className="flex items-end pb-2" style={{ color: 'var(--t-micro)' }}>
                        <span className="text-[18px] font-light leading-none">→</span>
                      </div>
                      <TimePicker
                        value={form.end}
                        onChange={v => setForm(f => ({ ...f, end: v }))}
                        label="Salida"
                        accentColor={form.color}
                      />
                      {/* Duration badge / error */}
                      {form.start && form.end && (() => {
                        const [sh, sm] = form.start.split(':').map(Number);
                        const [eh, em] = form.end.split(':').map(Number);
                        const mins = (eh * 60 + em) - (sh * 60 + sm);
                        const invalid = mins <= 0;
                        return (
                          <div className="flex items-end pb-1">
                            <span className="text-[11px] font-mono px-2 py-1 rounded-lg font-semibold"
                              style={{
                                background: invalid ? 'rgba(239,68,68,0.12)' : `${form.color}15`,
                                color: invalid ? '#ef4444' : form.color,
                                border: `1px solid ${invalid ? 'rgba(239,68,68,0.35)' : form.color + '30'}`,
                              }}>
                              {invalid ? '⚠ Hora inválida' : ((() => { const h = Math.floor(mins / 60), m = mins % 60; return m > 0 ? `${h}h ${m}m` : `${h}h`; })())}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Row 2.5: Almuerzo toggle (solo si tiene horas) */}
              {!hasNoHours(form) && (
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, hasLunch: !f.hasLunch }))}
                    className="relative flex items-center gap-2.5 cursor-pointer group"
                    style={{ outline: 'none' }}>
                    {/* Track */}
                    <div className="relative w-9 h-5 rounded-full transition-all duration-200 shrink-0"
                      style={{
                        background: form.hasLunch ? form.color : 'var(--s-subtle)',
                        border: `1.5px solid ${form.hasLunch ? form.color + '55' : 'var(--b-subtle)'}`,
                      }}>
                      {/* Thumb */}
                      <div className="absolute top-[2px] h-3.5 w-3.5 rounded-full transition-all duration-200"
                        style={{
                          left: form.hasLunch ? 'calc(100% - 16px)' : '2px',
                          background: form.hasLunch ? 'white' : 'var(--t-muted)',
                          boxShadow: form.hasLunch ? `0 1px 4px ${form.color}80` : 'none',
                        }} />
                    </div>
                    <span className="text-[11px] font-semibold transition-colors duration-150"
                      style={{ color: form.hasLunch ? form.color : 'var(--t-muted)' }}>
                      Incluye hora de almuerzo
                    </span>
                  </button>
                  {form.hasLunch && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                      style={{
                        background: `${form.color}12`,
                        color: form.color,
                        border: `1px solid ${form.color}25`,
                      }}>
                      −1h al total semanal
                    </span>
                  )}
                </div>
              )}

              {/* Row 3: Color palette + actions */}
              <div className="flex flex-wrap items-end justify-between gap-3 pb-1">
                {/* Color swatches */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: 'var(--t-micro)' }}>Color</label>
                  <div className="flex gap-2 flex-wrap pl-4 pr-1 pt-1 pb-2">
                    {PALETTE.map(c => (
                      <button key={c} type="button"
                        onClick={() => setForm(f => ({ ...f, color: c }))}
                        className="cursor-pointer transition-all duration-150 rounded-full"
                        style={{
                          width: 22, height: 22,
                          background: c,
                          transform: form.color === c ? 'scale(1.3)' : 'scale(1)',
                          outline: form.color === c ? `2.5px solid ${c}` : '2px solid transparent',
                          outlineOffset: form.color === c ? '3px' : '0',
                          boxShadow: form.color === c ? `0 0 10px ${c}60` : 'none',
                        }} />
                    ))}
                  </div>
                </div>

                {/* Confirm / Cancel */}
                <div className="flex gap-2">
                  <button type="button" onClick={cancelEdit}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold cursor-pointer transition-colors"
                    style={{ color: 'var(--t-muted)', background: 'var(--s-subtle)' }}>
                    <FiX size={12} /> Cancelar
                  </button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={editingId ? handleUpdate : handleCreate}
                    disabled={saving || !form.name.trim() || (() => {
                      if (hasNoHours(form)) return false;
                      if (!form.start || !form.end) return false;
                      const [sh, sm] = form.start.split(':').map(Number);
                      const [eh, em] = form.end.split(':').map(Number);
                      return (eh * 60 + em) <= (sh * 60 + sm);
                    })()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all disabled:opacity-40"
                    style={{
                      background: `${form.color}22`,
                      border: `1.5px solid ${form.color}50`,
                      color: form.color,
                    }}>
                    {saving
                      ? <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      : <FiCheck size={12} />}
                    {saving ? 'Guardando…' : (editingId ? 'Actualizar' : 'Crear turno')}
                  </motion.button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
