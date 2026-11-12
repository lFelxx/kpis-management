import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScheduleSlot, WeeklySchedule } from '../../../core/domain/Schedule/Schedule';

const { reorderTeam, showError } = vi.hoisted(() => ({ reorderTeam: vi.fn(), showError: vi.fn() }));

vi.mock('../../../core/instances/instances', () => ({
  scheduleRepository: { reorderTeam },
  notificationService: { showError, showSuccess: vi.fn() },
}));

import { useScheduleStore } from './schedule.store';

const slot = (id: number, adviserId: number, dayOfWeek: number): ScheduleSlot => ({
  id, adviserId, adviserName: `Asesor ${adviserId}`, teamRole: 'ADVISER', dayOfWeek,
  startTime: null, endTime: null, isRestDay: false, netMinutes: 0, notes: null, shiftTemplateId: null,
});

const schedule = (): WeeklySchedule => ({
  id: 1, weekStart: '2026-10-19', weekEnd: '2026-10-25', status: 'DRAFT', warnings: [],
  slots: [slot(1, 10, 1), slot(2, 10, 2), slot(3, 20, 1), slot(4, 20, 2)],
  adviserSummaries: [10, 20].map((adviserId) => ({
    adviserId, adviserName: `Asesor ${adviserId}`, teamRole: 'ADVISER', restDay: null, totalNetMinutes: 0, workedDays: 0,
  })),
});

describe('schedule.store reorderTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useScheduleStore.setState({ current: schedule() });
  });

  it('reordena filas y resumen al instante, conservando el orden de los días', async () => {
    reorderTeam.mockResolvedValue(undefined);

    await useScheduleStore.getState().reorderTeam([20, 10]);

    const { current } = useScheduleStore.getState();
    expect(current!.slots.map((s) => s.id)).toEqual([3, 4, 1, 2]);
    expect(current!.adviserSummaries.map((a) => a.adviserId)).toEqual([20, 10]);
    expect(reorderTeam).toHaveBeenCalledWith([20, 10]);
  });

  it('si el servidor falla vuelve al orden anterior y avisa', async () => {
    reorderTeam.mockRejectedValue(new Error('Error al guardar el orden del equipo'));

    await useScheduleStore.getState().reorderTeam([20, 10]);

    expect(useScheduleStore.getState().current!.slots.map((s) => s.id)).toEqual([1, 2, 3, 4]);
    expect(showError).toHaveBeenCalledWith('Error al guardar el orden del equipo');
  });
});
