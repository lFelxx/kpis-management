import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getVersion = vi.fn();
vi.mock('../../core/instances/instances', () => ({
  appInfoRepository: { getVersion: () => getVersion() },
}));

import { useReleaseTour } from './useReleaseTour';
import { useTourStore } from '../stores/ui/tour.store';
import { useOnboardingStore } from '../stores/ui/onboarding.store';
import { CURRENT_RELEASE_TOUR, RELEASE_SEEN_KEY } from '../tours/releaseTour';

function renderGate() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/dashboard']}>{children}</MemoryRouter>
  );
  return renderHook(() => {
    useReleaseTour();
    return useLocation().pathname;
  }, { wrapper });
}

describe('useReleaseTour', () => {
  beforeEach(() => {
    getVersion.mockReset();
    localStorage.clear();
    useTourStore.setState({ active: null, releaseChecked: false });
    useOnboardingStore.setState({ visible: false }); // usuario que ya conoce la app
  });

  it('en una versión nueva redirige a la ruta del recorrido y lo inicia', async () => {
    getVersion.mockResolvedValue('2.0.1');

    const { result } = renderGate();

    await waitFor(() => expect(result.current).toBe(CURRENT_RELEASE_TOUR.route));
    expect(useTourStore.getState().active).toBe(CURRENT_RELEASE_TOUR.tour);
    expect(localStorage.getItem(RELEASE_SEEN_KEY)).toBe('2.0.1');
    expect(useTourStore.getState().releaseChecked).toBe(true);
  });

  it('si ya vio esa versión no redirige ni inicia nada', async () => {
    localStorage.setItem(RELEASE_SEEN_KEY, '2.0.1');
    getVersion.mockResolvedValue('2.0.1');

    const { result } = renderGate();

    await waitFor(() => expect(getVersion).toHaveBeenCalled());
    expect(result.current).toBe('/dashboard');
    expect(useTourStore.getState().active).toBeNull();
  });

  it('al subir app.version vuelve a mostrarse una vez', async () => {
    localStorage.setItem(RELEASE_SEEN_KEY, '2.0.1');
    getVersion.mockResolvedValue('2.1.0');

    const { result } = renderGate();

    await waitFor(() => expect(result.current).toBe(CURRENT_RELEASE_TOUR.route));
    expect(localStorage.getItem(RELEASE_SEEN_KEY)).toBe('2.1.0');
  });

  it('un usuario nuevo (ventana de incógnito) también va directo al recorrido, sin ver la guía de uso', async () => {
    useOnboardingStore.setState({ visible: true });
    getVersion.mockResolvedValue('2.0.1');

    const { result } = renderGate();

    await waitFor(() => expect(result.current).toBe(CURRENT_RELEASE_TOUR.route));
    expect(useTourStore.getState().active).toBe(CURRENT_RELEASE_TOUR.tour);
    expect(useOnboardingStore.getState().visible).toBe(false);
    expect(localStorage.getItem('kpis_onboarded_v1')).toBe('1');
  });

  it('si el backend no responde la app sigue normal, sin recorrido', async () => {
    getVersion.mockRejectedValue(new Error('sin conexión'));

    const { result } = renderGate();

    await waitFor(() => expect(getVersion).toHaveBeenCalled());
    expect(result.current).toBe('/dashboard');
    expect(useTourStore.getState().active).toBeNull();
    expect(localStorage.getItem(RELEASE_SEEN_KEY)).toBeNull();
    // la guía de bienvenida queda disponible como respaldo
    expect(useTourStore.getState().releaseChecked).toBe(true);
  });

  it('con la misma versión también marca la revisión como terminada (para no bloquear la guía)', async () => {
    localStorage.setItem(RELEASE_SEEN_KEY, '2.0.1');
    getVersion.mockResolvedValue('2.0.1');

    renderGate();

    await waitFor(() => expect(useTourStore.getState().releaseChecked).toBe(true));
  });
});
