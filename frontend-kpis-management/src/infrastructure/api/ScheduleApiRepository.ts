import {
  WeeklySchedule,
  WeeklyScheduleSummary,
  ScheduleSlotUpdateRequest,
  ScheduleConfig,
} from '../../core/domain/Schedule/Schedule';
import { ScheduleRepository } from '../../core/interfaces/repositories/ScheduleRepository';
import { request } from './apiClient';

export class ScheduleApiRepository implements ScheduleRepository {
  private readonly base: string;

  constructor(apiUrl: string) {
    this.base = `${apiUrl}/v1/schedule`;
  }

  async getAll(): Promise<WeeklyScheduleSummary[]> {
    const r = await request(this.base, {}, { requireAuth: true });
    if (!r.ok) throw new Error('Error al obtener los horarios');
    return r.json();
  }

  async getById(id: number): Promise<WeeklySchedule> {
    const r = await request(`${this.base}/${id}`, {}, { requireAuth: true });
    if (!r.ok) throw new Error('Error al obtener el horario');
    return r.json();
  }

  async create(weekStart: string): Promise<WeeklySchedule> {
    const r = await request(
      `${this.base}?weekStart=${weekStart}`,
      { method: 'POST' },
      { requireAuth: true }
    );
    if (!r.ok) {
      const body = await r.json().catch(() => null);
      throw new Error(body?.message ?? 'Error al crear el horario');
    }
    return r.json();
  }

  async generate(id: number): Promise<WeeklySchedule> {
    const r = await request(
      `${this.base}/${id}/generate`,
      { method: 'POST' },
      { requireAuth: true }
    );
    if (!r.ok) throw new Error('Error al generar el horario');
    return r.json();
  }

  async updateSlot(slotId: number, req: ScheduleSlotUpdateRequest): Promise<WeeklySchedule> {
    const r = await request(
      `${this.base}/slots/${slotId}`,
      { method: 'PUT', body: JSON.stringify(req) },
      { requireAuth: true }
    );
    if (!r.ok) throw new Error('Error al actualizar el slot');
    return r.json();
  }

  async publish(id: number): Promise<WeeklySchedule> {
    const r = await request(
      `${this.base}/${id}/publish`,
      { method: 'PUT' },
      { requireAuth: true }
    );
    if (!r.ok) throw new Error('Error al publicar el horario');
    return r.json();
  }

  async unpublish(id: number): Promise<WeeklySchedule> {
    const r = await request(
      `${this.base}/${id}/unpublish`,
      { method: 'PUT' },
      { requireAuth: true }
    );
    if (!r.ok) {
      const body = await r.json().catch(() => null);
      throw new Error(body?.message ?? 'Error al desbloquear el horario');
    }
    return r.json();
  }

  async getConfig(): Promise<ScheduleConfig> {
    const r = await request(`${this.base}/config`, {}, { requireAuth: true });
    if (!r.ok) throw new Error('Error al obtener la configuración');
    return r.json();
  }

  async saveConfig(cfg: Partial<ScheduleConfig>): Promise<ScheduleConfig> {
    const r = await request(
      `${this.base}/config`,
      { method: 'PUT', body: JSON.stringify(cfg) },
      { requireAuth: true }
    );
    if (!r.ok) throw new Error('Error al guardar la configuración');
    return r.json();
  }

  async clearSlots(id: number): Promise<WeeklySchedule> {
    const r = await request(
      `${this.base}/${id}/slots`,
      { method: 'DELETE' },
      { requireAuth: true }
    );
    if (!r.ok) throw new Error('Error al limpiar el horario');
    return r.json();
  }

  async exportExcel(id: number): Promise<Blob> {
    const r = await request(`${this.base}/${id}/export`, {}, { requireAuth: true });
    if (!r.ok) throw new Error('Error al exportar el horario');
    return r.blob();
  }
}
