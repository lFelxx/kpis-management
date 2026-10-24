import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiInfo, FiX } from 'react-icons/fi';
import { useTourStore } from '../../stores/ui/tour.store';
import type { TourDefinition } from './tour.types';
import { VIEWPORT_MARGIN, isCompactViewport, isLargeTarget, placeCard } from './placeCard';
import type { Box, Size } from './placeCard';

/**
 * Recorrido paso a paso con spotlight, reutilizable para cualquier novedad.
 * Se abre con `useTourStore().start(tour)`; ver `tours/` para definir recorridos
 * y `hooks/useReleaseTour` para mostrarlos una sola vez por versión.
 */

const CARD_MAX_WIDTH = 380;
// La primera búsqueda espera a que la página termine de cargar; las siguientes ya no necesitan tanto
const FIND_FIRST_TARGET_TIMEOUT_MS = 2500;
const FIND_NEXT_TARGET_TIMEOUT_MS = 1000;
const SPOTLIGHT_SETTLE_MS = 500;
const DIM = 'rgba(2, 6, 23, 0.72)';

export function FeatureTour() {
  const tour = useTourStore((s) => s.active);
  const close = useTourStore((s) => s.close);

  return (
    <AnimatePresence>
      {tour && <TourRunner key={tour.id} tour={tour} onClose={close} />}
    </AnimatePresence>
  );
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

/** Espera a que el elemento exista y sea visible (la página puede estar cargando datos). */
function findElement(selector: string, timeoutMs: number, isCancelled: () => boolean): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const look = () => {
      if (isCancelled()) return resolve(null);
      const el = document.querySelector<HTMLElement>(selector);
      const rect = el?.getBoundingClientRect();
      if (el && rect && (rect.width > 0 || rect.height > 0)) return resolve(el);
      if (performance.now() - startedAt >= timeoutMs) return resolve(null);
      window.setTimeout(look, 100);
    };
    look();
  });
}

/**
 * Lleva el elemento a la vista. Se usa scroll instantáneo porque la app declara
 * `scroll-behavior: smooth` y dos scrolls animados seguidos se pisan entre sí.
 * Los elementos grandes (tablas) y las pantallas chicas se alinean arriba, para dejar
 * libre la parte de abajo donde se acopla la tarjeta.
 */
function revealElement(el: HTMLElement, viewport: Size) {
  const compact = isCompactViewport(viewport);
  const alignTop = compact || isLargeTarget(el.getBoundingClientRect().height, viewport.h);

  el.scrollIntoView({ block: alignTop ? 'start' : 'center', inline: 'nearest', behavior: 'instant' });
  if (alignTop) window.scrollBy({ top: compact ? -88 : -24, behavior: 'instant' }); // deja libre la barra superior
}

// ─── Runner ──────────────────────────────────────────────────────────────────

interface RunnerProps {
  tour: TourDefinition;
  onClose: () => void;
}

function TourRunner({ tour, onClose }: RunnerProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const bodyId = useId();

  const steps = tour.steps;
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [boxIndex, setBoxIndex] = useState(-1);
  const [missing, setMissing] = useState(false);
  const [smooth, setSmooth] = useState(true);
  const [viewport, setViewport] = useState<Size>({ w: window.innerWidth, h: window.innerHeight });
  const [cardSize, setCardSize] = useState<Size>({ w: CARD_MAX_WIDTH, h: 280 });

  const pageSettled = useRef(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardEl, setCardEl] = useState<HTMLDivElement | null>(null);
  // Ref con callback: con AnimatePresence "wait" la tarjeta nueva se monta DESPUÉS de que sale la anterior,
  // así que hay que medir exactamente el elemento que acaba de montarse (no el que se está yendo).
  const attachCard = useCallback((el: HTMLDivElement | null) => {
    cardRef.current = el;
    setCardEl(el);
  }, []);

  const step = steps[index];
  const isLast = index === steps.length - 1;
  const ready = boxIndex === index;

  const goTo = useCallback((nextIndex: number) => {
    if (nextIndex < 0) return;
    if (nextIndex >= steps.length) { onClose(); return; }
    setIndex(nextIndex);
  }, [steps.length, onClose]);

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Los handlers de teclado y el efecto de búsqueda siempre ven la última versión
  const latest = useRef({ next, prev, onClose });
  latest.current = { next, prev, onClose };

  // Busca el elemento del paso, lo muestra y sigue su posición (scroll, resize, cambios de tamaño)
  useEffect(() => {
    let cancelled = false;
    let stopTracking: (() => void) | undefined;

    if (!step.target) {
      setBox(null);
      setMissing(false);
      setBoxIndex(index);
      return;
    }

    const timeout = pageSettled.current ? FIND_NEXT_TARGET_TIMEOUT_MS : FIND_FIRST_TARGET_TIMEOUT_MS;
    findElement(step.target, timeout, () => cancelled).then((el) => {
      if (cancelled) return;
      pageSettled.current = true;

      if (!el) {
        // El elemento no existe todavía (ej. no hay ninguna semana creada): el paso se explica igual, centrado
        setBox(null);
        setMissing(true);
        setBoxIndex(index);
        return;
      }

      setMissing(false);
      revealElement(el, { w: window.innerWidth, h: window.innerHeight });

      const measure = () => {
        const r = el.getBoundingClientRect();
        setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
      };
      measure();
      setBoxIndex(index);

      let frame = 0;
      const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(measure);
      };
      const observer = new ResizeObserver(schedule);
      observer.observe(el);
      window.addEventListener('resize', schedule);
      window.addEventListener('scroll', schedule, true);

      stopTracking = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('resize', schedule);
        window.removeEventListener('scroll', schedule, true);
      };
    });

    return () => {
      cancelled = true;
      stopTracking?.();
    };
  }, [index, step.target]);

  // El resaltado se desliza entre pasos; mientras el usuario hace scroll solo sigue al elemento
  useEffect(() => {
    setSmooth(true);
    const timer = window.setTimeout(() => setSmooth(false), SPOTLIGHT_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Mide la tarjeta para colocarla sin salirse de la pantalla
  useLayoutEffect(() => {
    if (!cardEl) return;
    const update = () => setCardSize({ w: cardEl.offsetWidth, h: cardEl.offsetHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(cardEl);
    return () => observer.disconnect();
  }, [cardEl]);

  // Teclado: ← → navegan, Esc cierra y Tab queda dentro de la tarjeta
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); latest.current.onClose(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); latest.current.next(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); latest.current.prev(); return; }
      if (e.key !== 'Tab' || !cardRef.current) return;

      const focusables = cardRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!cardRef.current.contains(active)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Al terminar, el foco vuelve a donde estaba
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => previouslyFocused?.focus?.();
  }, []);

  const padding = step.padding ?? 8;
  const compact = isCompactViewport(viewport);
  const docked = compact || (box !== null && isLargeTarget(box.height, viewport.h));
  const cardWidth = Math.min(CARD_MAX_WIDTH, viewport.w - VIEWPORT_MARGIN * 2);
  // La tarjeta nunca supera la pantalla; acoplada abajo deja ver al menos el 40% del elemento resaltado
  const maxCardHeight = Math.max(220, Math.round(docked ? viewport.h * 0.6 : viewport.h - VIEWPORT_MARGIN * 2));
  const cardPosition = placeCard(box, { w: cardWidth, h: cardSize.h }, viewport, step.placement ?? 'auto', padding);

  const spotlight = box
    ? { top: box.top - padding, left: box.left - padding, width: box.width + padding * 2, height: box.height + padding * 2 }
    : { top: viewport.h / 2, left: viewport.w / 2, width: 0, height: 0 };

  const Icon = step.icon;
  const accent = step.accent;
  const progress = ((index + 1) / steps.length) * 100;
  const duration = reduceMotion ? 0 : 0.22;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      {/* Resaltado: el box-shadow gigante oscurece todo menos el elemento */}
      <motion.div
        aria-hidden="true"
        className="fixed pointer-events-none"
        initial={false}
        animate={spotlight}
        transition={reduceMotion || !smooth ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 32 }}
        style={{ borderRadius: 18, boxShadow: `0 0 0 9999px ${DIM}` }}
      >
        <motion.span
          className="absolute inset-0"
          animate={{ opacity: box ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          style={{ borderRadius: 'inherit', boxShadow: `inset 0 0 0 2px ${accent}, 0 0 32px ${accent}66` }}
        />
        {box && !reduceMotion && (
          <motion.span
            className="absolute -inset-1.5"
            animate={{ opacity: [0.65, 0], scale: [1, 1.035] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            style={{ borderRadius: 22, border: `2px solid ${accent}` }}
          />
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {ready && (
          <motion.div
            key={step.id}
            ref={attachCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className="fixed flex flex-col overflow-hidden"
            style={{
              ...(cardPosition.docked ? { bottom: VIEWPORT_MARGIN } : { top: cardPosition.top }),
              left: cardPosition.left,
              width: cardWidth,
              maxHeight: maxCardHeight,
              borderRadius: '1.5rem',
              border: '1px solid var(--b-line)',
              backgroundColor: 'var(--s-card, white)',
              backgroundImage: `radial-gradient(120% 70% at 0% 0%, ${accent}22, transparent 60%)`,
              boxShadow: `0 28px 80px rgba(0,0,0,0.45), 0 0 0 1px ${accent}26`,
            }}
          >
            {/* Progreso */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'var(--b-subtle)' }}>
              <motion.div
                className="h-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }}
              />
            </div>

            {/* Número de fondo */}
            <div
              aria-hidden="true"
              className="absolute top-3 right-5 font-black select-none pointer-events-none"
              style={{ fontSize: 84, lineHeight: 1, color: accent, opacity: 0.08, letterSpacing: '-0.05em' }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>

            <div className={`relative min-h-0 flex-1 overflow-y-auto pt-6 pb-4 ${compact ? 'px-4' : 'px-5'}`}>
              <span className="sr-only" aria-live="polite">Paso {index + 1} de {steps.length}: {step.title}</span>

              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex items-center justify-center rounded-2xl shrink-0"
                    style={{ width: 44, height: 44, background: `${accent}1c`, border: `1.5px solid ${accent}38` }}
                  >
                    <Icon style={{ color: accent, fontSize: 19 }} aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.28em] truncate" style={{ color: accent }}>
                    {step.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--t-micro)' }}>
                    {index + 1} / {steps.length}
                  </span>
                  <button
                    onClick={onClose}
                    aria-label="Cerrar recorrido"
                    className="flex items-center justify-center rounded-xl cursor-pointer transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ width: 44, height: 44, color: 'var(--t-muted)', outlineColor: accent }}
                  >
                    <FiX size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <h2
                id={titleId}
                className="font-black mb-2"
                style={{ fontSize: 20, lineHeight: 1.2, letterSpacing: '-0.03em', color: 'var(--t-primary)' }}
              >
                {step.title}
              </h2>

              {step.visual && !compact && (
                <div
                  className="rounded-2xl p-3 mb-3"
                  style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}
                  aria-hidden="true"
                >
                  {step.visual}
                </div>
              )}

              <p id={bodyId} className="mb-3" style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--t-secondary)' }}>
                {step.body}
              </p>

              {step.bullets && (
                <ul className="flex flex-col gap-1.5 mb-3">
                  {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5" style={{ fontSize: 13, color: 'var(--t-secondary)' }}>
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {missing && (
                <div
                  className="flex items-start gap-2.5 rounded-2xl px-3.5 py-2.5 mb-3"
                  style={{ border: `1px dashed ${accent}66`, color: accent }}
                >
                  <FiInfo size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p style={{ fontSize: 12.5, lineHeight: 1.5, fontWeight: 600 }}>
                    {step.missingNote ?? 'Este elemento aún no aparece en tu pantalla; lo verás cuando tengas datos.'}
                  </p>
                </div>
              )}

              {step.tip && (
                <div
                  className="flex gap-3 rounded-2xl px-3.5 py-2.5"
                  style={{ background: `${accent}12`, border: `1px solid ${accent}2b` }}
                >
                  <span className="mt-0.5 text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color: accent }}>
                    TIP
                  </span>
                  <p style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--t-muted)' }}>{step.tip}</p>
                </div>
              )}
            </div>

            <div
              className="relative flex shrink-0 items-center justify-between gap-3 px-5 py-3"
              style={{ borderTop: '1px solid var(--b-line)' }}
            >
              <button
                onClick={onClose}
                className="min-h-[44px] px-1 text-xs font-bold cursor-pointer transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: 'var(--t-micro)', outlineColor: accent }}
              >
                Omitir recorrido
              </button>

              <div className="flex items-center gap-2">
                {index > 0 && (
                  <button
                    onClick={prev}
                    aria-label="Paso anterior"
                    className="flex items-center justify-center rounded-2xl cursor-pointer transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ width: 44, height: 44, color: 'var(--t-muted)', border: '1px solid var(--b-line)', outlineColor: accent }}
                  >
                    <FiArrowLeft size={16} aria-hidden="true" />
                  </button>
                )}
                <button
                  onClick={next}
                  autoFocus
                  className="flex items-center gap-2 min-h-[44px] rounded-2xl px-5 text-sm font-bold text-white cursor-pointer transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    boxShadow: `0 8px 20px ${accent}40`,
                    outlineColor: accent,
                  }}
                >
                  {isLast ? 'Entendido' : 'Siguiente'}
                  {!isLast && <FiArrowRight size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body,
  );
}
