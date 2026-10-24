import type { TourPlacement } from './tour.types';

export const VIEWPORT_MARGIN = 16;
export const COMPACT_BREAKPOINT = 640;
const CARD_GAP = 18;
/** Un elemento que ocupa más de esta fracción de la altura de la pantalla se considera "grande" (ej. una tabla). */
const LARGE_TARGET_RATIO = 0.45;

export interface Box { top: number; left: number; width: number; height: number }
export interface Size { w: number; h: number }
/** `docked`: la tarjeta va pegada al borde inferior (se ancla con CSS, sin depender de su altura medida). */
export interface CardPosition { top: number; left: number; docked: boolean }
type Side = Exclude<TourPlacement, 'auto'>;

export const isCompactViewport = (viewport: Size) => viewport.w < COMPACT_BREAKPOINT;
export const isLargeTarget = (targetHeight: number, viewportHeight: number) =>
  targetHeight > viewportHeight * LARGE_TARGET_RATIO;

/**
 * Calcula dónde dibujar la tarjeta del recorrido junto al elemento resaltado (`box`, en coordenadas
 * de la ventana).
 *
 * - El resultado SIEMPRE queda dentro de la pantalla.
 * - Con pantallas chicas (móvil) o elementos grandes (una tabla), la tarjeta se ACOPLA abajo y no
 *   depende de la posición del scroll: así no salta de arriba a abajo mientras el usuario se desplaza.
 * - Con elementos pequeños se coloca al lado (abajo, arriba, derecha o izquierda según el espacio).
 */
export function placeCard(
  box: Box | null,
  card: Size,
  viewport: Size,
  preferred: TourPlacement,
  padding: number,
): CardPosition {
  const clampX = (x: number) => Math.min(Math.max(VIEWPORT_MARGIN, x), viewport.w - card.w - VIEWPORT_MARGIN);
  const clampY = (y: number) => Math.min(Math.max(VIEWPORT_MARGIN, y), viewport.h - card.h - VIEWPORT_MARGIN);
  const inViewport = (p: { top: number; left: number }): CardPosition => ({ top: clampY(p.top), left: clampX(p.left), docked: false });

  const dockedBottom = (): CardPosition => ({
    ...inViewport({ top: viewport.h - card.h - VIEWPORT_MARGIN, left: (viewport.w - card.w) / 2 }),
    docked: true,
  });

  if (!box) return inViewport({ top: (viewport.h - card.h) / 2, left: (viewport.w - card.w) / 2 });
  if (isCompactViewport(viewport) || isLargeTarget(box.height, viewport.h)) return dockedBottom();

  const edge = {
    top: box.top - padding,
    left: box.left - padding,
    right: box.left + box.width + padding,
    bottom: box.top + box.height + padding,
  };
  const space = {
    top: edge.top,
    bottom: viewport.h - edge.bottom,
    left: edge.left,
    right: viewport.w - edge.right,
  };
  const needed = { vertical: card.h + CARD_GAP + VIEWPORT_MARGIN, horizontal: card.w + CARD_GAP + VIEWPORT_MARGIN };
  const fits: Record<Side, boolean> = {
    top: space.top >= needed.vertical,
    bottom: space.bottom >= needed.vertical,
    left: space.left >= needed.horizontal,
    right: space.right >= needed.horizontal,
  };

  const order: Side[] = preferred === 'auto'
    ? ['bottom', 'top', 'right', 'left']
    : [preferred, 'bottom', 'top', 'right', 'left'];
  const side = order.find((s) => fits[s]);

  const centerX = box.left + box.width / 2 - card.w / 2;
  const centerY = box.top + box.height / 2 - card.h / 2;

  switch (side) {
    case 'bottom': return inViewport({ top: edge.bottom + CARD_GAP, left: centerX });
    case 'top':    return inViewport({ top: edge.top - CARD_GAP - card.h, left: centerX });
    case 'right':  return inViewport({ top: centerY, left: edge.right + CARD_GAP });
    case 'left':   return inViewport({ top: centerY, left: edge.left - CARD_GAP - card.w });
    default:       return dockedBottom(); // no cabe junto al elemento
  }
}
