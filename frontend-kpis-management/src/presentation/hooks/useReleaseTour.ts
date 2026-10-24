import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { appInfoRepository } from '../../core/instances/instances';
import { useOnboardingStore } from '../stores/ui/onboarding.store';
import { useTourStore } from '../stores/ui/tour.store';
import { CURRENT_RELEASE_TOUR, RELEASE_SEEN_KEY } from '../tours/releaseTour';

/**
 * Redirige y muestra el recorrido de novedades la primera vez que se abre una versión nueva
 * (app.version del backend). La versión vista se guarda en el navegador, así que es una sola vez.
 *
 * El recorrido reemplaza a la guía de bienvenida: quien lo recibe no ve la guía (incluso un usuario
 * nuevo o una ventana de incógnito). La guía solo aparece como respaldo si no hubo recorrido.
 */
export function useReleaseTour() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    (async () => {
      try {
        const version = await appInfoRepository.getVersion();
        if (!version || localStorage.getItem(RELEASE_SEEN_KEY) === version) return;

        localStorage.setItem(RELEASE_SEEN_KEY, version);
        useOnboardingStore.getState().dismiss();
        navigateRef.current(CURRENT_RELEASE_TOUR.route, { replace: true });
        useTourStore.getState().start(CURRENT_RELEASE_TOUR.tour);
      } catch {
        // Sin versión del backend no hay recorrido; la app sigue funcionando normal
      } finally {
        useTourStore.getState().markReleaseChecked();
      }
    })();
  }, []);
}
