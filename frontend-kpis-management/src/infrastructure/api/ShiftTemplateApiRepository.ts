import { request } from './apiClient';
import { ShiftTemplate, ShiftTemplateRequest } from '../../core/domain/Schedule/ShiftTemplate';
import { config } from '../../config/environment';

const BASE = `${config.apiUrl}/v1/shift-templates`;

export const shiftTemplateApi = {
  async getAll(): Promise<ShiftTemplate[]> {
    const r = await request(BASE, {}, { requireAuth: false });
    if (!r.ok) throw new Error('Error al obtener los turnos');
    return r.json();
  },
  async create(req: ShiftTemplateRequest): Promise<ShiftTemplate> {
    const r = await request(BASE, {
      method: 'POST', body: JSON.stringify(req),
    }, { requireAuth: true });
    if (!r.ok) throw new Error('Error al crear el turno');
    return r.json();
  },
  async update(id: number, req: Partial<ShiftTemplateRequest>): Promise<ShiftTemplate> {
    const r = await request(`${BASE}/${id}`, {
      method: 'PUT', body: JSON.stringify(req),
    }, { requireAuth: true });
    if (!r.ok) throw new Error('Error al actualizar el turno');
    return r.json();
  },
  async delete(id: number): Promise<void> {
    const r = await request(`${BASE}/${id}`, { method: 'DELETE' }, { requireAuth: true });
    if (!r.ok) throw new Error('Error al eliminar el turno');
  },
};
