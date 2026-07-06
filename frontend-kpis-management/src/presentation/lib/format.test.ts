import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateProgressPercentage,
  getProgressColor,
  calculateWeeklyGrowth,
  formatPercentage,
} from './format';

describe('formatCurrency', () => {
  it('formats positive amount in COP locale', () => {
    const result = formatCurrency(1_000_000);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });

  it('formats zero as $0', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('rounds to whole number — no decimal separator', () => {
    const result = formatCurrency(1_500_999.9);
    // es-CO uses '.' as thousands separator; confirm no decimal comma appears
    expect(result).not.toMatch(/,\d/);
  });
});

describe('calculateProgressPercentage', () => {
  it('returns 0 when goal is 0', () => {
    expect(calculateProgressPercentage(500, 0)).toBe(0);
  });

  it('returns 0 when goal is negative', () => {
    expect(calculateProgressPercentage(500, -100)).toBe(0);
  });

  it('returns percentage of current over goal', () => {
    expect(calculateProgressPercentage(80, 100)).toBe(80);
  });

  it('clamps to 100 when current exceeds goal', () => {
    expect(calculateProgressPercentage(150, 100)).toBe(100);
  });

  it('returns exactly 100 when current equals goal', () => {
    expect(calculateProgressPercentage(100, 100)).toBe(100);
  });
});

describe('getProgressColor', () => {
  it('returns green class at 100%', () => {
    expect(getProgressColor(100)).toContain('green');
  });

  it('returns yellow class at 80%', () => {
    expect(getProgressColor(80)).toContain('yellow');
  });

  it('returns orange class at 60%', () => {
    expect(getProgressColor(60)).toContain('orange');
  });

  it('returns red class below 60%', () => {
    expect(getProgressColor(59)).toContain('red');
  });
});

describe('calculateWeeklyGrowth', () => {
  it('returns 0 when previous week is 0', () => {
    expect(calculateWeeklyGrowth(500, 0)).toBe(0);
  });

  it('calculates positive growth', () => {
    expect(calculateWeeklyGrowth(110, 100)).toBeCloseTo(10);
  });

  it('calculates negative growth', () => {
    expect(calculateWeeklyGrowth(80, 100)).toBeCloseTo(-20);
  });

  it('returns 0% when same as previous', () => {
    expect(calculateWeeklyGrowth(100, 100)).toBe(0);
  });
});

describe('formatPercentage', () => {
  it('defaults to 1 decimal place', () => {
    expect(formatPercentage(85.678)).toBe('85.7%');
  });

  it('respects custom decimals parameter', () => {
    expect(formatPercentage(85.678, 2)).toBe('85.68%');
    expect(formatPercentage(85.678, 0)).toBe('86%');
  });

  it('handles 0%', () => {
    expect(formatPercentage(0)).toBe('0.0%');
  });
});
