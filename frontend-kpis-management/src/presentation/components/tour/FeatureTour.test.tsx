import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FiStar } from 'react-icons/fi';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeatureTour } from './FeatureTour';
import { tourTarget } from './tour.types';
import type { TourDefinition } from './tour.types';
import { useTourStore } from '../../stores/ui/tour.store';

const tour: TourDefinition = {
  id: 'test-tour',
  steps: [
    { id: 'intro', icon: FiStar, accent: '#10b981', label: 'Intro', title: 'Bienvenida', body: 'Texto de bienvenida' },
    { id: 'box', target: tourTarget('box'), icon: FiStar, accent: '#06b6d4', label: 'Caja', title: 'La caja', body: 'Texto de la caja' },
    { id: 'missing', target: tourTarget('no-existe'), icon: FiStar, accent: '#f59e0b', label: 'Nada', title: 'Paso sin elemento', body: 'Texto del paso', missingNote: 'Aparece cuando haya datos.' },
    { id: 'outro', icon: FiStar, accent: '#8b5cf6', label: 'Fin', title: 'Despedida', body: 'Texto final' },
  ],
};

function mountTour() {
  render(
    <>
      <div data-tour="box">Elemento resaltado</div>
      <FeatureTour />
    </>,
  );
  act(() => useTourStore.getState().start(tour));
}

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
  window.dispatchEvent(new Event('resize'));
}

/** Simula que el elemento "box" mide `height` y está a `top` px del borde superior de la ventana. */
function placeBox(top: number, height: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const isBox = this.getAttribute('data-tour') === 'box';
    return { top, left: 20, width: isBox ? 900 : 0, height: isBox ? height : 0, right: 920, bottom: top + height, x: 20, y: top, toJSON: () => ({}) };
  });
}

const boxOnlyTour: TourDefinition = {
  id: 'box-only',
  steps: [{
    id: 'box', target: tourTarget('box'), icon: FiStar, accent: '#10b981', label: 'Caja', title: 'Elemento grande',
    body: 'Texto', tip: 'Un tip', visual: <span data-testid="visual">ilustración</span>,
  }],
};

/** Abre el recorrido y avanza hasta el paso del elemento resaltado (esperando la animación entre pasos). */
async function goToBoxStep() {
  mountTour();
  fireEvent.click(await screen.findByRole('button', { name: /Siguiente/ }));
  await screen.findByRole('heading', { name: 'La caja' });
}

describe('FeatureTour', () => {
  beforeAll(() => {
    // jsdom no implementa estas APIs del navegador
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollBy = vi.fn();
  });

  beforeEach(() => {
    useTourStore.setState({ active: null });
    // jsdom devuelve cajas de 0x0: se simula un elemento visible
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const visible = this.getAttribute('data-tour') === 'box';
      return { top: 100, left: 100, width: visible ? 200 : 0, height: visible ? 80 : 0, right: 300, bottom: 180, x: 100, y: 100, toJSON: () => ({}) };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setViewport(1024, 768);
  });

  it('no dibuja nada mientras no hay un recorrido activo', () => {
    render(<FeatureTour />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra el primer paso con su contador y avanza con Siguiente', async () => {
    mountTour();

    expect(await screen.findByRole('heading', { name: 'Bienvenida' })).toBeInTheDocument();
    expect(screen.getByText('1 / 4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    expect(await screen.findByRole('heading', { name: 'La caja' })).toBeInTheDocument();
    expect(screen.getByText('2 / 4')).toBeInTheDocument();
  });

  it('si el elemento no existe (ej. sin ninguna semana) el paso se muestra igual, centrado y con un aviso', async () => {
    await goToBoxStep();
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

    expect(await screen.findByRole('heading', { name: 'Paso sin elemento' }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('Aparece cuando haya datos.')).toBeInTheDocument();
    expect(screen.getByText('3 / 4')).toBeInTheDocument();
  }, 10000);

  it('un paso sin aviso propio muestra uno genérico cuando falta su elemento', async () => {
    useTourStore.setState({ active: null });
    const withoutNote: TourDefinition = {
      id: 'sin-aviso',
      steps: [{ id: 'x', target: tourTarget('no-existe'), icon: FiStar, accent: '#10b981', label: 'X', title: 'Solo', body: 'Texto' }],
    };
    render(<FeatureTour />);
    act(() => useTourStore.getState().start(withoutNote));

    expect(await screen.findByText(/aún no aparece en tu pantalla/, undefined, { timeout: 4000 })).toBeInTheDocument();
  }, 10000);

  it('permite volver al paso anterior', async () => {
    mountTour();
    fireEvent.click(await screen.findByRole('button', { name: /Siguiente/ }));
    await screen.findByRole('heading', { name: 'La caja' });

    fireEvent.click(screen.getByRole('button', { name: 'Paso anterior' }));

    expect(await screen.findByRole('heading', { name: 'Bienvenida' })).toBeInTheDocument();
  });

  it('Omitir recorrido lo cierra', async () => {
    mountTour();
    fireEvent.click(await screen.findByRole('button', { name: 'Omitir recorrido' }));

    expect(useTourStore.getState().active).toBeNull();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Escape lo cierra', async () => {
    mountTour();
    await screen.findByRole('dialog');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(useTourStore.getState().active).toBeNull();
  });

  it('en el último paso el botón dice Entendido y al pulsarlo termina', async () => {
    await goToBoxStep();
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    await screen.findByRole('heading', { name: 'Paso sin elemento' }, { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    await screen.findByRole('heading', { name: 'Despedida' });

    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));

    expect(useTourStore.getState().active).toBeNull();
  }, 10000);

  describe('elemento grande y pantallas chicas', () => {
    it('la tarjeta de un elemento grande (el grid) no cambia de lugar al hacer scroll', async () => {
      placeBox(20, 900);
      render(<><div data-tour="box">Grid</div><FeatureTour /></>);
      act(() => useTourStore.getState().start(boxOnlyTour));

      const dialog = await screen.findByRole('dialog');
      const initialTop = dialog.style.top;
      expect(initialTop).not.toBe('');

      for (const top of [-300, -800, 400, -1500, 20]) {
        placeBox(top, 900);
        act(() => { window.dispatchEvent(new Event('scroll')); });
        await act(async () => { await new Promise((resolve) => requestAnimationFrame(() => resolve(null))); });
        expect(screen.getByRole('dialog').style.top).toBe(initialTop);
      }
    });

    it('en móvil la tarjeta no supera la pantalla y oculta la ilustración para ganar espacio', async () => {
      setViewport(375, 667);
      placeBox(120, 80);
      render(<><div data-tour="box">Caja</div><FeatureTour /></>);
      act(() => useTourStore.getState().start(boxOnlyTour));

      const dialog = await screen.findByRole('dialog');
      expect(parseInt(dialog.style.maxHeight, 10)).toBeLessThanOrEqual(667 - 32);
      expect(parseInt(dialog.style.width, 10)).toBeLessThanOrEqual(375 - 32);
      expect(screen.queryByTestId('visual')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Entendido' })).toBeInTheDocument(); // los botones siguen accesibles
    });

    it('en escritorio con un elemento pequeño sí muestra la ilustración', async () => {
      placeBox(120, 80);
      render(<><div data-tour="box">Caja</div><FeatureTour /></>);
      act(() => useTourStore.getState().start(boxOnlyTour));

      await screen.findByRole('dialog');
      expect(screen.getByTestId('visual')).toBeInTheDocument();
    });

    it('al abrir un elemento grande se alinea arriba con scroll instantáneo (la app usa scroll-behavior: smooth)', async () => {
      placeBox(500, 900);
      render(<><div data-tour="box">Grid</div><FeatureTour /></>);
      act(() => useTourStore.getState().start(boxOnlyTour));

      await screen.findByRole('dialog');
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({ block: 'start', behavior: 'instant' }),
      );
    });
  });

});
