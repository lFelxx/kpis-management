import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRocket,
  FaFileExcel,
  FaChartBar,
  FaExclamationTriangle,
  FaTachometerAlt,
} from 'react-icons/fa';

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0';

interface Step {
  number:    string;
  icon:      React.ElementType;
  accent:    string;
  label:     string;
  title:     string;
  body:      string;
  tip?:      string;
  bullets?:  string[];
}

const STEPS: Step[] = [
  {
    number:  '00',
    icon:    FaRocket,
    accent:  '#10b981',
    label:   `v${APP_VERSION}`,
    title:   '¡Hay novedades en la app!',
    body:    'Esta versión trae nuevas métricas, alertas automáticas y una mejor experiencia de carga. La guía te muestra los cambios clave en 4 pasos rápidos.',
    bullets: [
      'PAF Global — presupuesto acumulado a la fecha según distribución de días',
      'Proyección al cierre del mes en el Total Ventas',
      'Alerta automática de asesores en riesgo de meta (< 80%)',
      'Skeleton loaders en Dashboard y Asesores',
    ],
  },
  {
    number:  '01',
    icon:    FaFileExcel,
    accent:  '#10b981',
    label:   'Presupuesto',
    title:   'Carga tu presupuesto mensual',
    body:    'Sube el archivo Excel con las ventas objetivo distribuidas por día. Este archivo define la Meta Total del mes y el PAF Global que ves en el dashboard.',
    tip:     'Ve a Presupuesto en el menú lateral → arrastra tu .xlsx. El sistema distribuye los montos por día automáticamente.',
  },
  {
    number:  '02',
    icon:    FaChartBar,
    accent:  '#06b6d4',
    label:   'Ventas',
    title:   'Registra las ventas del equipo',
    body:    'Cada día sube el reporte de ventas brutas desde Carga de Ventas. El sistema mapea cada fila a su asesor y actualiza el Total Ventas y la proyección al cierre en tiempo real.',
    tip:     'La proyección usa ritmo lineal: (ventas ÷ días transcurridos) × días del mes. Se muestra junto al Total Ventas.',
  },
  {
    number:  '03',
    icon:    FaExclamationTriangle,
    accent:  '#f59e0b',
    label:   'Alertas',
    title:   'Asesores en riesgo de meta',
    body:    'Si algún asesor proyecta cerrar el mes por debajo del 80% de su meta, aparece un banner naranja al tope del dashboard con su nombre y porcentaje proyectado.',
    tip:     'Toca Ver detalle en el banner para ver la tabla completa con ventas actuales, proyectadas y meta individual.',
  },
  {
    number:  '04',
    icon:    FaTachometerAlt,
    accent:  '#6366f1',
    label:   'Dashboard',
    title:   'Las métricas en un vistazo',
    body:    'El dashboard centraliza 6 indicadores: Total Ventas (con proyección), Meta Total del mes, Cumplimiento, PAF Global, Mejor UPT y Líder de Ventas del equipo.',
    tip:     'El PAF Global es el presupuesto acumulado hasta hoy según la distribución de días cargada — no el mes completo.',
  },
];

const slideVariants = (dir: number) => ({
  enter:  { x: dir * 40, opacity: 0 },
  center: { x: 0,        opacity: 1 },
  exit:   { x: dir * -40, opacity: 0 },
});

interface Props {
  onDismiss: () => void;
}

export function OnboardingWizard({ onDismiss }: Props) {
  const [step, setStep]       = useState(0);
  const [direction, setDir]   = useState(1);

  const goTo = useCallback((next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }, [step]);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) goTo(step + 1);
    else onDismiss();
  }, [step, goTo, onDismiss]);

  const prev = useCallback(() => {
    if (step > 0) goTo(step - 1);
  }, [step, goTo]);

  const current  = STEPS[step];
  const isLast   = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      aria-modal="true"
      role="dialog"
      aria-label="Guía de inicio"
    >
      <motion.div
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{    scale: 0.96, y: 16, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full overflow-hidden"
        style={{
          maxWidth:     520,
          background:   'var(--s-card, white)',
          borderRadius: '2rem',
          border:       '1px solid var(--b-line)',
          boxShadow:    '0 32px 80px rgba(0,0,0,0.35)',
        }}
      >
        {/* Barra de progreso */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'var(--b-subtle)' }}
        >
          <motion.div
            className="absolute inset-y-0 left-0"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ background: current.accent }}
          />
        </div>

        {/* Número watermark */}
        <div
          aria-hidden="true"
          className="absolute top-4 right-6 font-black select-none pointer-events-none"
          style={{
            fontSize:         96,
            lineHeight:       1,
            color:            current.accent,
            opacity:          0.07,
            letterSpacing:    '-0.05em',
            transition:       'color 0.35s',
          }}
        >
          {current.number}
        </div>

        {/* Contenido animado */}
        <div className="px-8 pt-10 pb-6" style={{ minHeight: 360 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              variants={slideVariants(direction)}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Label + icono */}
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex items-center justify-center rounded-2xl shrink-0"
                  style={{
                    width:      48,
                    height:     48,
                    background: `${current.accent}18`,
                    border:     `1.5px solid ${current.accent}30`,
                  }}
                >
                  <current.icon style={{ color: current.accent, fontSize: 20 }} />
                </motion.div>
                <span
                  className="text-[10px] font-black uppercase tracking-[0.3em]"
                  style={{ color: current.accent }}
                >
                  {current.label}
                </span>
              </div>

              {/* Título */}
              <h2
                className="font-black tracking-tight mb-3"
                style={{
                  fontSize:      22,
                  color:         'var(--t-primary)',
                  lineHeight:    1.2,
                  letterSpacing: '-0.03em',
                }}
              >
                {current.title}
              </h2>

              {/* Cuerpo */}
              <p
                className="mb-5 leading-relaxed"
                style={{ fontSize: 14, color: 'var(--t-secondary)', lineHeight: 1.65 }}
              >
                {current.body}
              </p>

              {/* Bullets (paso 0) */}
              {current.bullets && (
                <ul className="flex flex-col gap-2 mb-2">
                  {current.bullets.map((b, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: 'var(--t-secondary)' }}
                    >
                      <span
                        className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ background: current.accent }}
                      />
                      {b}
                    </motion.li>
                  ))}
                </ul>
              )}

              {/* Tip */}
              {current.tip && (
                <div
                  className="flex gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: `${current.accent}0d`,
                    border:     `1px solid ${current.accent}22`,
                  }}
                >
                  <span
                    className="mt-0.5 text-xs font-black uppercase tracking-widest shrink-0"
                    style={{ color: current.accent }}
                  >
                    TIP
                  </span>
                  <p style={{ fontSize: 13, color: 'var(--t-muted)', lineHeight: 1.6 }}>
                    {current.tip}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{ borderTop: '1px solid var(--b-line)' }}
        >
          <button
            onClick={onDismiss}
            className="text-xs font-bold transition-opacity hover:opacity-70 cursor-pointer"
            style={{ color: 'var(--t-micro)' }}
          >
            Omitir guía
          </button>

          <div className="flex items-center gap-4">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Paso ${i + 1}`}
                  className="rounded-full cursor-pointer transition-all duration-300"
                  style={{
                    height:  6,
                    width:   i === step ? 20 : 6,
                    background: i === step
                      ? current.accent
                      : i < step
                        ? `${current.accent}50`
                        : 'var(--b-line)',
                  }}
                />
              ))}
            </div>

            {step > 0 && (
              <button
                onClick={prev}
                className="text-sm font-bold cursor-pointer transition-opacity hover:opacity-70"
                style={{ color: 'var(--t-muted)' }}
              >
                ← Atrás
              </button>
            )}

            <motion.button
              onClick={next}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 font-bold text-sm rounded-2xl px-5 py-2.5 cursor-pointer"
              style={{
                background:    current.accent,
                color:         'white',
                border:        'none',
                letterSpacing: '-0.01em',
                transition:    'background 0.35s',
              }}
            >
              {isLast ? 'Empezar' : 'Siguiente'}
              {!isLast && <span aria-hidden>→</span>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
