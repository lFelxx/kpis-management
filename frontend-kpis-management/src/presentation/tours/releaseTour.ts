import type { TourDefinition } from '../components/tour/tour.types';
import { scheduleTour } from './scheduleTour';

/**
 * Recorrido que se muestra UNA vez por versión a quien vuelve a abrir la app.
 *
 * Para anunciar una novedad nueva:
 *   1. Crea el recorrido en `tours/` (ver scheduleTour.tsx) y marca los elementos con `data-tour="..."`.
 *   2. Apunta `CURRENT_RELEASE_TOUR` a ese recorrido y a la ruta donde debe empezar.
 *   3. Sube `app.version` en el application.properties del backend.
 * La versión se compara con la guardada en el navegador (`RELEASE_SEEN_KEY`); si cambió, se redirige
 * a `route` y se inicia el recorrido. Ver `hooks/useReleaseTour.ts`.
 */
export const CURRENT_RELEASE_TOUR: { tour: TourDefinition; route: string } = {
  tour: scheduleTour,
  route: '/schedule',
};

export const RELEASE_SEEN_KEY = 'kpis_release_seen';
