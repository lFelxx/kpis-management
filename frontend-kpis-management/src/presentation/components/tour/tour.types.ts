import type { ElementType, ReactNode } from 'react';

export type TourPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  id: string;
  /** Selector CSS del elemento a resaltar (ver `tourTarget`). Sin target = tarjeta centrada. */
  target?: string;
  icon: ElementType;
  accent: string;
  /** Etiqueta corta sobre el título, ej. "Semana". */
  label: string;
  title: string;
  body: string;
  bullets?: string[];
  tip?: string;
  /** Se muestra, junto a la tarjeta centrada, cuando el elemento aún no existe en pantalla (ej. sin datos). */
  missingNote?: string;
  /** Mini ilustración opcional que se muestra entre el título y el texto. */
  visual?: ReactNode;
  placement?: TourPlacement;
  /** Espacio entre el elemento y el borde del resaltado (px). */
  padding?: number;
}

export interface TourDefinition {
  id: string;
  steps: TourStep[];
}

/** Marca un elemento como objetivo de un paso: <div data-tour="shift-bar"> ↔ target: tourTarget('shift-bar') */
export const tourTarget = (name: string) => `[data-tour="${name}"]`;
