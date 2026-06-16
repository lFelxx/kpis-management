import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaCalendarAlt, FaEdit, FaUndo, FaCheckCircle } from 'react-icons/fa';
import { useBudgetStore } from '../stores/budget/budget.store';
import { DailyDistribution } from '../../core/domain/BudgetTemplate/BudgetTemplate';
import { formatCurrency } from '../lib/format';
import { MONTH_NAMES } from '../lib/constants';
import { formatDate, isToday, isPast } from '../lib/dates';

interface EditAdviserModalProps {
  day: DailyDistribution;
  year: number;
  month: number;
  onClose: () => void;
}

function EditAdviserModal({ day, year, month, onClose }: EditAdviserModalProps) {
  const [count, setCount] = useState(day.adviserCount.toString());
  const { updateAdviserCount, loading } = useBudgetStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(count, 10);
    if (isNaN(value) || value < 0) return;
    await updateAdviserCount(year, month, day.date, value);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-3xl p-8 w-full max-w-sm"
        style={{
          background: 'var(--s-card)',
          border: '1px solid var(--b-line)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}
      >
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--t-primary)' }}>Editar asesores</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--t-muted)' }}>
          {formatDate(day.date)} — {formatCurrency(day.dailyAmount)}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: 'var(--t-muted)' }}>
              Cantidad de asesores
            </label>
            <input
              type="number"
              min={0}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-base outline-none focus:ring-2"
              style={{
                background: 'var(--s-subtle)',
                border: '1px solid var(--b-line)',
                color: 'var(--t-primary)',
              }}
              autoFocus
            />
            {parseInt(count, 10) > 0 && (
              <p className="text-xs mt-2" style={{ color: '#34d399' }}>
                Meta por asesor: {formatCurrency(day.dailyAmount / parseInt(count, 10))}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              style={{ background: 'var(--s-subtle)', color: 'var(--t-muted)', border: '1px solid var(--b-subtle)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #34d399, #22d3ee)', color: '#000' }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export const BudgetTemplatePage = () => {
  const { template, loading, uploadTemplate, fetchTemplate, resetOverride } = useBudgetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [editingDay, setEditingDay] = useState<DailyDistribution | null>(null);

  useEffect(() => {
    fetchTemplate(year, month);
  }, [year, month, fetchTemplate]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadTemplate(file, year, month);
    e.target.value = '';
  };

  const handleReset = async (day: DailyDistribution) => {
    await resetOverride(year, month, day.date);
  };

  const today = new Date().toISOString().slice(0, 10);
  const pafUpToToday = template?.days
    .filter((d) => d.date <= today)
    .reduce((sum, d) => sum + d.dailyAmount, 0) ?? 0;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter mb-1" style={{ color: 'var(--t-primary)' }}>
          Distribución de Presupuesto
        </h1>
        <p className="text-sm" style={{ color: 'var(--t-muted)' }}>
          Sube el Excel mensual para distribuir metas diarias por asesor
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 items-end">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}
        >
          <FaCalendarAlt style={{ color: '#34d399' }} />
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-transparent text-sm font-semibold outline-none cursor-pointer"
            style={{ color: 'var(--t-primary)' }}
          >
            {MONTH_NAMES.slice(1).map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-transparent text-sm font-semibold outline-none w-16 text-center"
            style={{ color: 'var(--t-primary)' }}
            min={2020}
            max={2100}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold cursor-pointer disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg, #34d399, #22d3ee)', color: '#000' }}
        >
          <FaUpload size={14} />
          {loading ? 'Procesando...' : 'Subir Excel'}
        </motion.button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
      </div>

      {template && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Presupuesto total', value: formatCurrency(template.totalBudget) },
            { label: 'Distribuido',       value: formatCurrency(template.distributedBudget) },
            { label: 'PAF hasta hoy',     value: formatCurrency(pafUpToToday) },
            { label: 'Días cargados',     value: `${template.days.length} días` },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl p-4"
              style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}>
              <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: 'var(--t-micro)' }}>
                {card.label}
              </p>
              <p className="text-lg font-black" style={{ color: 'var(--t-primary)' }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {loading && !template && (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && !template && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-12 text-center"
          style={{ background: 'var(--s-subtle)', border: '1px dashed var(--b-line)' }}
        >
          <FaUpload size={32} className="mx-auto mb-4" style={{ color: 'var(--t-micro)' }} />
          <p className="text-base font-semibold" style={{ color: 'var(--t-muted)' }}>
            No hay presupuesto para {MONTH_NAMES[month]} {year}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--t-micro)' }}>
            Sube el archivo Excel para comenzar
          </p>
        </motion.div>
      )}

      {template && (
        <div className="rounded-3xl overflow-hidden"
          style={{ border: '1px solid var(--b-line)', background: 'var(--s-card)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--b-subtle)', background: 'var(--s-subtle)' }}>
                  {['Día', '% Peso', 'Monto diario', 'Asesores', 'Meta/Asesor', 'Estado'].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider"
                      style={{ color: 'var(--t-micro)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {template.days.map((day, i) => {
                  const todayRow = isToday(day.date);
                  const pastRow  = isPast(day.date);
                  return (
                    <motion.tr
                      key={day.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.015 }}
                      style={{
                        borderBottom: '1px solid var(--b-subtle)',
                        background: todayRow ? 'rgba(52,211,153,0.06)' : 'transparent',
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold"
                            style={{ color: pastRow ? 'var(--t-muted)' : 'var(--t-primary)' }}>
                            {formatDate(day.date)}
                          </span>
                          {todayRow && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                              Hoy
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--t-secondary)' }}>
                        {(day.weightPercentage * 100).toFixed(2)}%
                      </td>
                      <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--t-primary)' }}>
                        {formatCurrency(day.dailyAmount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${day.manualOverride ? 'text-amber-400' : ''}`}
                            style={day.manualOverride ? undefined : { color: 'var(--t-primary)' }}>
                            {day.adviserCount}
                          </span>
                          {day.manualOverride && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                              Manual
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold" style={{ color: '#34d399' }}>
                        {day.adviserCount > 0 ? formatCurrency(day.goalPerAdviser) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingDay(day)}
                            className="p-1.5 rounded-lg cursor-pointer transition-colors"
                            style={{ background: 'var(--s-subtle)', color: 'var(--t-muted)' }}
                            title="Editar asesores"
                          >
                            <FaEdit size={12} />
                          </motion.button>
                          {day.manualOverride && (
                            <motion.button
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => handleReset(day)}
                              className="p-1.5 rounded-lg cursor-pointer transition-colors"
                              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}
                              title="Resetear a valor del Excel"
                            >
                              <FaUndo size={12} />
                            </motion.button>
                          )}
                          {!day.manualOverride && (
                            <FaCheckCircle size={12} style={{ color: 'rgba(52,211,153,0.4)' }} />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 flex items-center gap-4 flex-wrap"
            style={{ borderTop: '1px solid var(--b-subtle)' }}>
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--t-muted)' }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#fbbf24' }} />
              Asesores editados manualmente
            </span>
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--t-muted)' }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#34d399' }} />
              Valor del Excel
            </span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {editingDay && (
          <EditAdviserModal
            day={editingDay}
            year={year}
            month={month}
            onClose={() => setEditingDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
