import { request } from './apiClient';
import { GenerationRule, GenerationRuleRequest } from '../../core/domain/Schedule/GenerationRule';
import { config } from '../../config/environment';

const BASE = `${config.apiUrl}/v1/generation-rules`;

export const generationRuleApi = {
  async getAll(): Promise<GenerationRule[]> {
    const r = await request(BASE, {}, { requireAuth: true });
    if (!r.ok) throw new Error('Error al obtener las reglas');
    return r.json();
  },
  async create(req: GenerationRuleRequest): Promise<GenerationRule> {
    const r = await request(BASE, {
      method: 'POST', body: JSON.stringify(req),
    }, { requireAuth: true });
    if (!r.ok) throw new Error('Error al crear la regla');
    return r.json();
  },
  async update(id: number, req: Partial<GenerationRuleRequest>): Promise<GenerationRule> {
    const r = await request(`${BASE}/${id}`, {
      method: 'PUT', body: JSON.stringify(req),
    }, { requireAuth: true });
    if (!r.ok) throw new Error('Error al actualizar la regla');
    return r.json();
  },
  async remove(id: number): Promise<void> {
    const r = await request(`${BASE}/${id}`, { method: 'DELETE' }, { requireAuth: true });
    if (!r.ok) throw new Error('Error al eliminar la regla');
  },
};
