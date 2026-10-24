import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiSend, FiZap, FiTrash2, FiSettings, FiX, FiUnlock, FiHelpCircle, FiChevronDown, FiImage, FiFileText } from 'react-icons/fi';
import { toPng } from 'html-to-image';
import { useScheduleStore } from '../stores/schedule/schedule.store';
import { useTourStore } from '../stores/ui/tour.store';
import { scheduleTour } from '../tours/scheduleTour';
import { useAuthStore } from '../stores/auth/auth.store';
import { useShiftTemplateStore } from '../stores/schedule/shiftTemplate.store';
import { ScheduleSlot, WeeklyScheduleSummary } from '../../core/domain/Schedule/Schedule';
import { WeekNavigator, fmtWeekYear, weekNumber } from './schedule/WeekNavigator';
import { ScheduleGrid } from './schedule/ScheduleGrid';
import { DaySlotEditor } from './schedule/DaySlotEditor';
import { WeeklySummaryRow } from './schedule/WeeklySummaryRow';import { ShiftBrushBar, Brush, templateToBrush } from './schedule/ShiftBrushBar';
import { GenerationRulesConfig } from './schedule/GenerationRulesConfig';

// Nombre fijo por ahora: el formato es el de la tienda La Estación
const EXPORT_FILENAME = 'FORMATO HORARIO SEMANAL LA ESTACION.xlsx';

/** Fecha local en formato YYYY-MM-DD (toISOString usaría UTC y puede adelantar el día). */
function localISODate(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function daysBetween(from: string, to: string): number {
  const msPerDay = 864e5;
  return Math.round((new Date(to + 'T00:00:00').getTime() - new Date(from + 'T00:00:00').getTime()) / msPerDay);
}

/** Semana que contiene hoy; si esa semana aún no existe, la más cercana a hoy. */
function findCurrentWeek(summaries: WeeklyScheduleSummary[]): WeeklyScheduleSummary | null {
  if (summaries.length === 0) return null;

  const today = localISODate();
  const containsToday = summaries.find(s => s.weekStart <= today && today <= s.weekEnd);
  if (containsToday) return containsToday;

  const distanceToToday = (s: WeeklyScheduleSummary) =>
    today < s.weekStart ? daysBetween(today, s.weekStart) : daysBetween(s.weekEnd, today);

  return summaries.reduce((closest, s) => (distanceToToday(s) < distanceToToday(closest) ? s : closest));
}

export function SchedulePage() {
  const {
    summaries, current, loading, saving,
    fetchAll, fetchById, create, generate, updateSlot, publish, unpublish, clearSlots, exportExcel,
  } = useScheduleStore();

  const startTour = useTourStore((s) => s.start);
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_MANAGER');

  const { templates } = useShiftTemplateStore();
  const brushes: Brush[] = templates.map(templateToBrush);

  const exportRef = useRef<HTMLDivElement>(null);

  const [selectedId, setSelectedId]       = useState<number | null>(null);
  const [activeBrushId, setActiveBrush]   = useState<string | null>(null);
  const [editingSlot, setEditingSlot]     = useState<ScheduleSlot | null>(null);
  const [confirmPublish, setConfirm]      = useState(false);
  const [confirmClear, setConfirmClear]   = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting]         = useState(false);
  const [exportingImg, setExportingImg]   = useState(false);
  const [brushOpen, setBrushOpen]         = useState(true);

  // Auto-select first brush when templates load
  useEffect(() => {
    if (!activeBrushId && brushes.length > 0) {
      setActiveBrush(brushes[0].id);
    }
  }, [brushes.length]);

  useEffect(() => {
    fetchAll().then(() => {
      const currentWeek = findCurrentWeek(useScheduleStore.getState().summaries);
      if (currentWeek && !selectedId) setSelectedId(currentWeek.id);
    });
  }, []);

  useEffect(() => { if (selectedId) fetchById(selectedId); }, [selectedId]);

  const weekDates: string[] = [];
  if (current) {
    const start = new Date(current.weekStart + 'T00:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      weekDates.push(d.toISOString().slice(0, 10));
    }
  }

  const handleCreate = async (weekStart: string) => {
    await create(weekStart);
    const store = useScheduleStore.getState();
    const sorted = [...store.summaries].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
    if (sorted.length > 0) setSelectedId(sorted[0].id);
  };

  /** Paint interaction: click on a cell applies the active brush instantly */
  const handleCellClick = async (slot: ScheduleSlot) => {
    const brush = brushes.find(b => b.id === activeBrushId);
    if (!brush || isPublished) return;

    if (brush.isRest) {
      await updateSlot(slot.id, { isRestDay: true, startTime: null, endTime: null, notes: slot.notes ?? null, shiftTemplateId: parseInt(brush.id) });
    } else {
      // If same brush already → clear slot (blank)
      const sameShift = slot.shiftTemplateId === parseInt(brush.id);
      if (sameShift) {
        await updateSlot(slot.id, {
          isRestDay: false, startTime: null, endTime: null, notes: null,
          shiftTemplateId: null,
        });
      } else {
        await updateSlot(slot.id, {
          isRestDay: false,
          startTime: brush.start ? brush.start + ':00' : null,
          endTime:   brush.end   ? brush.end   + ':00' : null,
          notes: slot.notes ?? null,
          shiftTemplateId: parseInt(brush.id),
        });
      }
    }
  };

  const handleExport = async () => {
    if (!current) return;
    setExporting(true);
    setShowExportModal(false);
    await exportExcel(current.id, EXPORT_FILENAME);
    setExporting(false);
  };

  const handleExportImage = async () => {
    if (!exportRef.current || !current) return;
    setExportingImg(true);
    setShowExportModal(false);
    try {
      const node = exportRef.current;
      const png = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--bg').trim() || '#0a0a0a',
        filter: (el) => !(el instanceof HTMLElement && el.dataset.html2canvasIgnore === 'true'),
      });
      const link = document.createElement('a');
      link.download = `Horario ${current.weekStart} – ${current.weekEnd}.png`;
      link.href = png;
      link.click();
    } catch {
      /* silently ignore */
    } finally {
      setExportingImg(false);
    }
  };

  const handlePublish = () => {
    if (selectedId) { publish(selectedId); setConfirm(false); }
  };

  const handleClear = async () => {
    if (!current) return;
    await clearSlots(current.id);
    setConfirmClear(false);
  };

  const isPublished = current?.status === 'PUBLISHED';
  const activeBrush = brushes.find(b => b.id === activeBrushId) ?? null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-screen" style={{ background: 'var(--bg)' }}>
    <div className="max-w-[1600px] mx-auto space-y-5">

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Row 1: title (left) + action buttons (right) */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.38em] text-emerald-500 uppercase">GESTIÓN DE PERSONAL</span>
            <h1 className="text-3xl sm:text-[36px] font-bold tracking-[-0.05em] leading-none mt-1" style={{ color: 'var(--t-primary)' }}>
              Horarios
            </h1>
            <p className="text-[13px] mt-1.5 max-w-[380px]" style={{ color: 'var(--t-muted)' }}>
              Elige un turno y píntalo sobre la semana. Las horas se recalculan al instante.
            </p>
            <button onClick={() => startTour(scheduleTour)}
              className="mt-2 inline-flex items-center gap-1.5 min-h-[32px] text-[12px] font-semibold text-emerald-500 hover:text-emerald-400 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 rounded-lg">
              <FiHelpCircle size={13} aria-hidden="true" /> ¿Cómo funciona?
            </button>
          </div>

          {current && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {!isPublished && (
                <button data-tour="auto-generate" onClick={() => generate(selectedId!)} disabled={saving}
                  className="btn-glass flex items-center gap-1.5 text-sm px-3.5 py-2 cursor-pointer disabled:opacity-50">
                  <FiZap size={13} /> Auto-generar
                </button>
              )}
              <button data-tour="rules" onClick={() => setShowRulesModal(true)}
                className="btn-glass flex items-center gap-1.5 text-sm px-3.5 py-2 cursor-pointer">
                <FiSettings size={13} /> Reglas
              </button>
              {!isPublished && (
                <button data-tour="clear" onClick={() => setConfirmClear(true)} disabled={saving}
                  className="btn-glass flex items-center gap-1.5 text-sm px-3.5 py-2 cursor-pointer disabled:opacity-50 text-red-400 hover:text-red-500">
                  <FiTrash2 size={13} /> Limpiar
                </button>
              )}
              <button data-tour="export" onClick={() => setShowExportModal(true)}
                disabled={exporting || exportingImg}
                className="btn-glass flex items-center gap-1.5 text-sm px-3.5 py-2 cursor-pointer disabled:opacity-50">
                <FiDownload size={13} />
                {exporting ? 'Excel…' : exportingImg ? 'Imagen…' : 'Exportar'}
              </button>
              {!isPublished && (
                <button data-tour="publish" onClick={() => setConfirm(true)} disabled={saving}
                  className="btn-primary flex items-center gap-1.5 text-sm px-3.5 py-2 cursor-pointer disabled:opacity-50">
                  <FiSend size={13} /> Publicar
                </button>
              )}
              {isPublished && isAdmin && (
                <button data-tour="unpublish" onClick={() => unpublish(current!.id)} disabled={saving}
                  className="btn-glass flex items-center gap-1.5 text-sm px-3.5 py-2 cursor-pointer disabled:opacity-50 text-amber-500 hover:text-amber-600">
                  <FiUnlock size={13} /> Desbloquear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Row 2: week navigator (full width) */}
        <div data-tour="week-navigator">
          <WeekNavigator
            summaries={summaries}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreateWeek={handleCreate}
            loading={loading || saving}
          />
        </div>
      </motion.header>

      {/* ── Shift brush bar (collapsible) ── */}
      <div
        data-tour="shift-bar"
        className="rounded-[18px] overflow-hidden"
        style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}
      >
        {/* Toggle header — sits inside the card, no own border */}
        <button
          onClick={() => setBrushOpen(s => !s)}
          className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150"
          style={{
            background: 'transparent',
            borderBottom: brushOpen ? '1px solid var(--b-line)' : '1px solid transparent',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--s-subtle)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {/* Label */}
          <span className="text-[10px] font-bold tracking-[0.32em] text-emerald-500 uppercase select-none">
            Turnos
          </span>

          {/* Count badge */}
          {brushes.length > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md select-none"
              style={{
                background: 'rgba(16,185,129,0.1)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              {brushes.length}
            </span>
          )}

          {/* Active brush preview — only when a brush is actually selected */}
          {activeBrush ? (
            <div className="flex items-center gap-1.5 ml-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: activeBrush.color }}
              />
              <span className="text-[12px] font-semibold select-none" style={{ color: activeBrush.color }}>
                {activeBrush.name}
              </span>
              {!activeBrush.isRest && activeBrush.start && (
                <span className="text-[11px] font-mono select-none" style={{ color: 'var(--t-micro)' }}>
                  {activeBrush.start}–{activeBrush.end}
                </span>
              )}
            </div>
          ) : null}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Chevron */}
          <motion.span
            animate={{ rotate: brushOpen ? 180 : 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ color: 'var(--t-micro)', display: 'flex', pointerEvents: 'none' }}
          >
            <FiChevronDown size={15} />
          </motion.span>
        </button>

        {/* Collapsible body — inside the same card */}
        <AnimatePresence initial={false}>
          {brushOpen && (
            <motion.div
              key="brush-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'clip' }}
            >
              <ShiftBrushBar
                activeBrushId={activeBrushId}
                onSelectBrush={setActiveBrush}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="rounded-[22px] overflow-hidden animate-pulse border"
          style={{ background: 'var(--s-card)', borderColor: 'var(--b-line)' }}>
          {/* Header row: nombre + 7 días */}
          <div className="px-5 py-4 border-b flex gap-2" style={{ borderColor: 'var(--b-line)' }}>
            <div className="h-8 rounded-lg shrink-0" style={{ width: 140, background: 'var(--s-subtle)' }} />
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="flex-1 h-8 rounded-lg" style={{ background: 'var(--s-subtle)' }} />
            ))}
            <div className="h-8 rounded-lg shrink-0" style={{ width: 64, background: 'var(--s-subtle)' }} />
          </div>
          {/* Adviser rows */}
          {[1,2,3,4,5].map(r => (
            <div key={r} className="px-5 py-3 border-b flex gap-2 items-center"
              style={{ borderColor: 'var(--b-line)', opacity: 1 - r * 0.12 }}>
              <div className="h-12 rounded-xl shrink-0" style={{ width: 140, background: 'var(--s-subtle)' }} />
              {[1,2,3,4,5,6,7].map(c => (
                <div key={c} className="flex-1 h-[66px] rounded-xl"
                  style={{ background: 'var(--s-subtle)', opacity: c % 3 === 0 ? 0.5 : 1 }} />
              ))}
              <div className="h-12 rounded-xl shrink-0" style={{ width: 64, background: 'var(--s-subtle)' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && summaries.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--t-primary)' }}>Sin horarios creados</p>
          <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Usa "Nueva semana" para empezar</p>
        </motion.div>
      )}

      {/* ── Grid ── */}
      {current && !loading && (
        <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }} className="space-y-5">

          <div data-tour="schedule-grid" ref={exportRef} className="rounded-[22px] overflow-hidden"
            style={{ background: 'var(--s-card)' }}>
            {/* Centered week header — included in image export */}
            <div className="flex flex-col items-center py-4 gap-1"
              style={{ borderBottom: '1px solid var(--b-line)' }}>
              <span className="text-[10px] font-bold tracking-[0.38em] uppercase"
                style={{ color: 'var(--t-micro)' }}>
                SEMANA {weekNumber(current.weekStart)}
              </span>
              <span className="text-[22px] font-bold"
                style={{ color: 'var(--t-primary)', letterSpacing: '-0.04em' }}>
                {fmtWeekYear(current.weekStart, current.weekEnd)}
              </span>
            </div>
            <ScheduleGrid
              schedule={current}
              weekDates={weekDates}
              brushes={brushes}
              activeBrush={activeBrush}
              onCellClick={handleCellClick}
            />
          </div>

          {/* WeeklySummaryRow — outside capture area */}
          <div data-tour="week-summary">
            <WeeklySummaryRow summaries={current.adviserSummaries} slots={current.slots} />
          </div>
        </motion.div>
      )}

      {/* ── Generation rules modal ── */}
      <AnimatePresence>
        {showRulesModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowRulesModal(false)}>
            <motion.div initial={{ scale: 0.94, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-2xl rounded-[22px] shadow-2xl overflow-hidden"
              style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}
              onClick={e => e.stopPropagation()}>
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4"
                style={{ borderBottom: '1px solid var(--b-line)' }}>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.38em] text-emerald-500 uppercase">
                    Auto-generación
                  </span>
                  <h2 className="text-base font-bold mt-0.5" style={{ color: 'var(--t-primary)' }}>
                    Reglas de turno
                  </h2>
                </div>
                <button onClick={() => setShowRulesModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: 'var(--s-subtle)', color: 'var(--t-muted)' }}>
                  <FiX size={14} />
                </button>
              </div>
              {/* Modal body */}
              <div className="p-6">
                <GenerationRulesConfig />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Publish confirmation ── */}
      <AnimatePresence>
        {confirmPublish && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setConfirm(false)}>
            <motion.div initial={{ scale: 0.94, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm rounded-[22px] p-6 shadow-2xl"
              style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 mx-auto">
                <FiSend size={20} className="text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-center mb-1" style={{ color: 'var(--t-primary)' }}>Publicar horario</h3>
              <p className="text-sm text-center mb-5" style={{ color: 'var(--t-muted)' }}>
                El horario quedará visible y no podrá editarse.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(false)} className="flex-1 btn-glass text-sm py-2.5 cursor-pointer">
                  Cancelar
                </button>
                <button onClick={handlePublish} disabled={saving}
                  className="flex-1 btn-primary text-sm py-2.5 cursor-pointer disabled:opacity-60">
                  {saving ? 'Publicando…' : 'Sí, publicar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Clear confirmation ── */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => !saving && setConfirmClear(false)}>
            <motion.div initial={{ scale: 0.94, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm rounded-[22px] p-6 shadow-2xl"
              style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
                <FiTrash2 size={20} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-center mb-1" style={{ color: 'var(--t-primary)' }}>Limpiar horario</h3>
              <p className="text-sm text-center mb-5" style={{ color: 'var(--t-muted)' }}>
                Se borrarán todos los turnos, descansos y notas de esta semana. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmClear(false)} disabled={saving}
                  className="flex-1 btn-glass text-sm py-2.5 cursor-pointer disabled:opacity-60">
                  Cancelar
                </button>
                <button onClick={handleClear} disabled={saving}
                  className="flex-1 text-sm font-bold py-2.5 rounded-xl text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all duration-300 cursor-pointer disabled:opacity-60">
                  {saving ? 'Limpiando…' : 'Sí, limpiar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Export modal ── */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowExportModal(false)}>
            <motion.div
              initial={{ scale: 0.94, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm rounded-[22px] p-6 shadow-2xl"
              style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.38em] text-emerald-500 uppercase">
                    Exportar horario
                  </span>
                  <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--t-primary)' }}>
                    Elige el formato
                  </h3>
                </div>
                <button onClick={() => setShowExportModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: 'var(--s-subtle)', color: 'var(--t-muted)' }}>
                  <FiX size={14} />
                </button>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {/* Excel */}
                <motion.button
                  whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer text-left transition-colors"
                  style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b-subtle)'; }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <FiFileText size={18} style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: 'var(--t-primary)' }}>Excel (.xlsx)</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-muted)' }}>
                      Formato oficial de la tienda, listo para imprimir
                    </p>
                  </div>
                </motion.button>

                {/* Imagen */}
                <motion.button
                  whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                  onClick={handleExportImage}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer text-left transition-colors"
                  style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,182,212,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b-subtle)'; }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
                    <FiImage size={18} style={{ color: '#06b6d4' }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: 'var(--t-primary)' }}>Imagen (.png)</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-muted)' }}>
                      Captura del horario, ideal para compartir por WhatsApp
                    </p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notes editor (right-click / long-press use case) ── */}
      <DaySlotEditor
        slot={editingSlot}
        isPublished={isPublished}
        onClose={() => setEditingSlot(null)}
        onSave={async (slotId, req) => { await updateSlot(slotId, req); setEditingSlot(null); }}
        saving={saving}
      />
    </div>
    </main>
  );
}
