import { BudgetTemplate } from '../../core/domain/BudgetTemplate/BudgetTemplate';
import { BudgetTemplateRepository } from '../../core/interfaces/repositories/BudgetTemplateRepository';
import { request } from './apiClient';

export class BudgetTemplateApiRepository implements BudgetTemplateRepository {
  constructor(private readonly baseUrl: string) {}

  async upload(file: File, year: number, month: number): Promise<BudgetTemplate> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await request(
      `${this.baseUrl}/v1/budget-template/upload?year=${year}&month=${month}`,
      { method: 'POST', body: formData },
      { requireAuth: true }
    );
    if (!response.ok) throw new Error('Error al subir el presupuesto');
    return response.json();
  }

  async getByYearAndMonth(year: number, month: number): Promise<BudgetTemplate> {
    const response = await request(`${this.baseUrl}/v1/budget-template/${year}/${month}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('No existe presupuesto para este mes');
      throw new Error('Error al obtener el presupuesto');
    }
    return response.json();
  }

  async updateAdviserCount(year: number, month: number, date: string, adviserCount: number): Promise<BudgetTemplate> {
    const response = await request(
      `${this.baseUrl}/v1/budget-template/${year}/${month}/day/${date}/advisers`,
      { method: 'PUT', body: JSON.stringify({ adviserCount }) },
      { requireAuth: true }
    );
    if (!response.ok) throw new Error('Error al actualizar los asesores del día');
    return response.json();
  }

  async resetManualOverride(year: number, month: number, date: string): Promise<void> {
    const response = await request(
      `${this.baseUrl}/v1/budget-template/${year}/${month}/day/${date}/reset-override`,
      { method: 'PUT' },
      { requireAuth: true }
    );
    if (!response.ok) throw new Error('Error al resetear el override manual');
  }

  async toggleAdviserExclusion(year: number, month: number, date: string, adviserId: number): Promise<BudgetTemplate> {
    const response = await request(
      `${this.baseUrl}/v1/budget-template/${year}/${month}/day/${date}/exclusions/${adviserId}`,
      { method: 'POST' },
      { requireAuth: true }
    );
    if (!response.ok) throw new Error('Error al actualizar la incapacidad del asesor');
    return response.json();
  }
}
