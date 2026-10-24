import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiMinus } from 'react-icons/fi';
import { useGenerationRuleStore } from '../../stores/schedule/generationRule.store';
import { useShiftTemplateStore } from '../../stores/schedule/shiftTemplate.store';
import { useScheduleStore } from '../../stores/schedule/schedule.store';

function fmt(t: string | null) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function Counter({
  value, min = 0, color,
  onChange,
}: { value: number; min?: number; color?: string; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
        style={{ background: 'var(--s-subtle)', color: 'var(--t-muted)' }}>
        <FiMinus size={11} />
      </button>
      <span className="text-[15px] font-bold w-5 text-center"
        style={{ color: color ?? 'var(--t-primary)' }}>
        {value}
      </span>
      <button type="button"
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
        style={{ background: 'var(--s-subtle)', color: 'var(--t-muted)' }}>
        <FiPlus size={11} />
      </button>
    </div>
  );
}

export function GenerationRulesConfig() {
  const { rules, loading, saving, fetchAll, create, update, remove } = useGenerationRuleStore();
  const { templates, fetchAll: fetchTemplates } = useShiftTemplateStore();
  const { config, fetchConfig, saveConfig } = useScheduleStore();

  const [showAdd, setShowAdd] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [advisersPerDay, setAdvisersPerDay] = useState(1);
  const [auxiliariesPerDay, setAuxiliariesPerDay] = useState(0);

  useEffect(() => {
    fetchAll();
    fetchTemplates();
    fetchConfig();
  }, []);

  const availableTemplates = templates.filter(
    t => !t.isRest && !rules.some(r => r.shiftTemplateId === t.id)
  );

  const handleAdd = async () => {
    if (!selectedTemplateId) return;
    await create({
      shiftTemplateId: selectedTemplateId,
      advisersPerDay,
      auxiliariesPerDay,
      sortOrder: rules.length,
    });
    setShowAdd(false);
    setSelectedTemplateId(null);
    setAdvisersPerDay(1);
    setAuxiliariesPerDay(0);
  };

  const totalAdvisers = rules.reduce((a, r) => a + r.advisersPerDay, 0);
  const totalAux      = rules.reduce((a, r) => a + (r.auxiliariesPerDay ?? 0), 0);

  const minOpenings = config?.minOpeningsPerAdviser ?? 2;

  return (
    <div>
      {/* Constraint: min openings per adviser */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div>
          <p className="text-[11px] font-bold" style={{ color: 'var(--t-primary)' }}>
            Mínimo aperturas / asesor por semana
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--t-muted)' }}>
            El generador prioriza a quien lleve menos para cumplir esta cuota.
          </p>
        </div>
        <Counter
          value={minOpenings}
          min={0}
          color="#10b981"
          onChange={v => saveConfig({ minOpeningsPerAdviser: v })}
        />
      </div>

      {/* Description + add button */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--t-muted)' }}>
          Define qué turnos se usan al auto-generar y cuántos <strong style={{ color: 'var(--t-secondary)' }}>asesores</strong> y <strong style={{ color: 'var(--t-secondary)' }}>auxiliares</strong> entran en cada turno por día. ADMIN y CO no se tocan.
        </p>
        {availableTemplates.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAdd(s => !s)}
            className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            style={{
              background: showAdd ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.08)',
              border: `1.5px solid ${showAdd ? 'rgba(16,185,129,0.55)' : 'rgba(16,185,129,0.25)'}`,
              color: '#10b981',
            }}>
            <motion.div animate={{ rotate: showAdd ? 45 : 0 }} transition={{ duration: 0.18 }}>
              <FiPlus size={12} />
            </motion.div>
            Agregar turno
          </motion.button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden mb-4">
            <div className="flex flex-col gap-4 p-4 rounded-xl"
              style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}>

              {/* Template selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: 'var(--t-micro)' }}>Turno</label>
                <div className="flex gap-2 flex-wrap">
                  {availableTemplates.map(t => (
                    <button key={t.id} type="button"
                      onClick={() => setSelectedTemplateId(t.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer"
                      style={{
                        background: selectedTemplateId === t.id ? `${t.color}20` : 'var(--s-card)',
                        border: `1.5px solid ${selectedTemplateId === t.id ? t.color + '55' : 'var(--b-subtle)'}`,
                        color: selectedTemplateId === t.id ? t.color : 'var(--t-secondary)',
                        boxShadow: selectedTemplateId === t.id ? `0 0 0 3px ${t.color}15` : 'none',
                      }}>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Counters row */}
              <div className="flex flex-wrap gap-6 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: 'var(--t-micro)' }}>Asesores / día</label>
                  <Counter value={advisersPerDay} min={0} onChange={setAdvisersPerDay} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: 'var(--t-micro)' }}>Auxiliares / día</label>
                  <Counter value={auxiliariesPerDay} min={0} onChange={setAuxiliariesPerDay} />
                </div>
                <button type="button"
                  onClick={handleAdd}
                  disabled={!selectedTemplateId || saving || (advisersPerDay === 0 && auxiliariesPerDay === 0)}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#10b981', color: 'white' }}>
                  {saving ? 'Guardando…' : 'Confirmar'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules list */}
      {loading && rules.length === 0 ? (
        <div className="flex gap-3">
          {[1, 2].map(i => (
            <div key={i} className="h-16 flex-1 rounded-xl animate-pulse"
              style={{ background: 'var(--s-subtle)' }} />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="py-8 text-center rounded-xl" style={{ background: 'var(--s-subtle)' }}>
          <p className="text-[12px]" style={{ color: 'var(--t-muted)' }}>
            Sin reglas — el auto-generar no funcionará
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rules.map(rule => (
            <motion.div key={rule.id}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 px-4 py-3 rounded-xl"
              style={{ background: `${rule.shiftTemplateColor}10`, border: `1px solid ${rule.shiftTemplateColor}30` }}>

              {/* Top: name + times + delete */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: rule.shiftTemplateColor }} />
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--t-primary)' }}>
                    {rule.shiftTemplateName}
                  </span>
                  {rule.startTime && (
                    <span className="text-[11px] font-mono" style={{ color: 'var(--t-muted)' }}>
                      {fmt(rule.startTime)} – {fmt(rule.endTime)}
                    </span>
                  )}
                </div>
                <button type="button"
                  onClick={() => remove(rule.id)}
                  className="p-1.5 rounded-lg cursor-pointer transition-colors shrink-0"
                  style={{ color: 'var(--t-micro)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)';
                    (e.currentTarget as HTMLElement).style.color = '#ef4444';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--t-micro)';
                  }}>
                  <FiTrash2 size={13} />
                </button>
              </div>

              {/* Bottom: counters */}
              <div className="flex items-center gap-6">
                {/* Asesores */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--t-micro)' }}>
                    Asesores
                  </span>
                  <Counter
                    value={rule.advisersPerDay}
                    min={0}
                    color={rule.shiftTemplateColor}
                    onChange={v => {
                      if (v === 0 && (rule.auxiliariesPerDay ?? 0) === 0) remove(rule.id);
                      else update(rule.id, { advisersPerDay: v, auxiliariesPerDay: rule.auxiliariesPerDay ?? 0 });
                    }}
                  />
                </div>

                <div className="h-8 w-px" style={{ background: 'var(--b-subtle)' }} />

                {/* Auxiliares */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--t-micro)' }}>
                    Auxiliares
                  </span>
                  <Counter
                    value={rule.auxiliariesPerDay ?? 0}
                    min={0}
                    color={rule.shiftTemplateColor}
                    onChange={v => {
                      if (v === 0 && rule.advisersPerDay === 0) remove(rule.id);
                      else update(rule.id, { advisersPerDay: rule.advisersPerDay, auxiliariesPerDay: v });
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Summary */}
          <div className="flex items-center justify-between px-2 pt-2 pb-1"
            style={{ borderTop: '1px solid var(--b-subtle)' }}>
            <span className="text-[11px]" style={{ color: 'var(--t-muted)' }}>
              Total por día:
            </span>
            <div className="flex items-center gap-3 text-[12px] font-bold font-mono">
              <span style={{ color: 'var(--t-primary)' }}>
                {totalAdvisers} asesor{totalAdvisers !== 1 ? 'es' : ''}
              </span>
              <span style={{ color: 'var(--t-muted)' }}>+</span>
              <span style={{ color: 'var(--t-primary)' }}>
                {totalAux} auxiliar{totalAux !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
