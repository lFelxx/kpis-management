import { describe, expect, it } from 'vitest';
import { VIEWPORT_MARGIN, isCompactViewport, isLargeTarget, placeCard } from './placeCard';

const desktop = { w: 1280, h: 720 };
const laptop = { w: 1024, h: 600 };
const phone = { w: 375, h: 667 };
const card = { w: 380, h: 300 };
const phoneCard = { w: 343, h: 380 };

function expectInside(position: { top: number; left: number }, size: { w: number; h: number }, viewport: { w: number; h: number }) {
  expect(position.top).toBeGreaterThanOrEqual(VIEWPORT_MARGIN);
  expect(position.left).toBeGreaterThanOrEqual(VIEWPORT_MARGIN);
  expect(position.top + size.h).toBeLessThanOrEqual(viewport.h - VIEWPORT_MARGIN);
  expect(position.left + size.w).toBeLessThanOrEqual(viewport.w - VIEWPORT_MARGIN);
}

describe('placeCard', () => {
  it('sin elemento la tarjeta va centrada', () => {
    const position = placeCard(null, card, desktop, 'auto', 8);
    expect(position.left).toBe((desktop.w - card.w) / 2);
    expect(position.top).toBe((desktop.h - card.h) / 2);
  });

  it('con un elemento pequeño prefiere ubicarse debajo cuando hay espacio', () => {
    const box = { top: 80, left: 200, width: 400, height: 60 };
    const position = placeCard(box, card, desktop, 'bottom', 8);
    expect(position.top).toBe(box.top + box.height + 8 + 18);
  });

  it('con un elemento pequeño, si no cabe debajo se ubica arriba', () => {
    const box = { top: 560, left: 200, width: 400, height: 60 };
    const position = placeCard(box, card, desktop, 'bottom', 8);
    expect(position.top + card.h).toBeLessThan(box.top);
    expectInside(position, card, desktop);
  });

  describe('elementos grandes (el grid del paso 4)', () => {
    const gridHeight = 900;

    it('la tarjeta se acopla abajo y NO cambia de lugar mientras se hace scroll', () => {
      const dockedTop = desktop.h - card.h - VIEWPORT_MARGIN;
      const positions = new Set<string>();

      for (let top = -1600; top <= 1600; top += 40) {
        const box = { top, left: 40, width: 1200, height: gridHeight };
        const position = placeCard(box, card, desktop, 'auto', 8);
        expect(position.top).toBe(dockedTop);
        positions.add(`${position.top},${position.left}`);
      }
      expect(positions.size).toBe(1);
    });

    it('en una laptop de poca altura también queda dentro de la pantalla en cualquier scroll', () => {
      const tallCard = { w: 380, h: 360 };
      for (let top = -1600; top <= 1600; top += 40) {
        const box = { top, left: 20, width: 980, height: gridHeight };
        for (const placement of ['auto', 'bottom', 'top', 'left', 'right'] as const) {
          expectInside(placeCard(box, tallCard, laptop, placement, 8), tallCard, laptop);
        }
      }
    });

    it('se considera grande cuando ocupa casi la mitad de la pantalla o más', () => {
      expect(isLargeTarget(900, 720)).toBe(true);
      expect(isLargeTarget(330, 720)).toBe(true);
      expect(isLargeTarget(120, 720)).toBe(false);
    });
  });

  describe('pantallas chicas (móvil)', () => {
    it('se detectan por el ancho', () => {
      expect(isCompactViewport(phone)).toBe(true);
      expect(isCompactViewport(desktop)).toBe(false);
    });

    it('la tarjeta siempre queda acoplada abajo, esté donde esté el elemento', () => {
      const dockedTop = phone.h - phoneCard.h - VIEWPORT_MARGIN;

      for (let top = -800; top <= 1200; top += 50) {
        const box = { top, left: 16, width: 340, height: 80 };
        const position = placeCard(box, phoneCard, phone, 'auto', 8);
        expect(position.top).toBe(dockedTop);
        expectInside(position, phoneCard, phone);
      }
    });

    it('con el grid (elemento enorme) tampoco salta ni se sale de la pantalla', () => {
      for (let top = -1500; top <= 1500; top += 50) {
        const box = { top, left: 0, width: 960, height: 900 };
        const position = placeCard(box, phoneCard, phone, 'auto', 8);
        expect(position.top).toBe(phone.h - phoneCard.h - VIEWPORT_MARGIN);
      }
    });

    it('si la tarjeta es más ancha que lo disponible se centra sin salirse', () => {
      const wide = { w: 343, h: 300 };
      const position = placeCard({ top: 100, left: 16, width: 340, height: 60 }, wide, phone, 'auto', 8);
      expect(position.left).toBe((phone.w - wide.w) / 2);
    });
  });
});
