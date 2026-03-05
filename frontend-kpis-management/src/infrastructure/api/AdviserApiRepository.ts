import { Adviser } from '../../core/domain/Adviser/Adviser';
import { DashboardMetrics } from '../../core/domain/Adviser/DashboardMetrics';
import { AdviserRepository } from '../../core/interfaces/repositories/AdviserRepository';
import { request } from './apiClient';

export class AdviserApiRepository implements AdviserRepository {

  constructor(private readonly baseUrl: string) {}

  async getAll(): Promise<Adviser[]> {
    const response = await request(`${this.baseUrl}/advisers`);
    if (!response.ok) {
      throw new Error('Error al obtener los asesores');
    }
    return response.json();
  }

  async getById(id: string): Promise<Adviser | null> {
    const response = await request(`${this.baseUrl}/advisers/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Error al obtener el asesor');
    }
    return response.json();
  }

  async create(adviser: Omit<Adviser, 'id'>): Promise<Adviser> {
    const response = await request(
      `${this.baseUrl}/advisers`,
      { method: 'POST', body: JSON.stringify(adviser) },
      { requireAuth: true }
    );
    if (!response.ok) {
      throw new Error('Error al crear el asesor');
    }
    return response.json();
  }

  async update(id: string, adviser: Partial<Adviser>): Promise<Adviser> {
    const response = await request(
      `${this.baseUrl}/advisers/${id}`,
      { method: 'PUT', body: JSON.stringify(adviser) },
      { requireAuth: true }
    );
    if (!response.ok) {
      if (response.status === 404) throw new Error('Asesor no encontrado');
      throw new Error('Error al actualizar el asesor');
    }
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await request(
      `${this.baseUrl}/advisers/${id}`,
      { method: 'DELETE' },
      { requireAuth: true }
    );
    if (!response.ok) {
      if (response.status === 404) throw new Error('Asesor no encontrado');
      throw new Error('Error al eliminar el asesor');
    }
  }

  async addSale(adviserId: String, amount: number): Promise<void> {
    const now = new Date();
    const saleDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}Z`;
    const response = await request(
      `${this.baseUrl}/sales/add`,
      {
        method: 'POST',
        body: JSON.stringify({ adviserId, amount, saleDate }),
      },
      { requireAuth: true }
    );
    if (!response.ok) {
      throw new Error('Error al agregar la venta');
    }
  }

  async updateGoal(adviserId: String, year: number, month: number, goal: number): Promise<void> {
    const response = await request(
      `${this.baseUrl}/goals/${adviserId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ year, month, goal }),
      },
      { requireAuth: true }
    );
    if (!response.ok) {
      throw new Error('Error al actualizar la meta');
    }
  }

  async updateMonthlySales(adviserId: string, year: number, month: number, totalSales: number): Promise<void> {
    const response = await request(
      `${this.baseUrl}/monthly-summary/by-adviser/${adviserId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ year, month, totalSales }),
      },
      { requireAuth: true }
    );
    if (!response.ok) {
      throw new Error('Error al actualizar las ventas');
    }
  }

  async updateAllGoals(year: number, month: number, goal: number): Promise<void> {
    const response = await request(
      `${this.baseUrl}/goals/all`,
      {
        method: 'PUT',
        body: JSON.stringify({ year, month, goal }),
      },
      { requireAuth: true }
    );
    if (!response.ok) {
      throw new Error('Error al actualizar las metas de todos los asesores');
    }
  }

  async getDashboardMetrics(year: number, month: number): Promise<DashboardMetrics> {
    const response = await request(
      `${this.baseUrl}/metrics/dashboard?year=${year}&month=${month}`
    );
    if (!response.ok) {
      throw new Error('Error al obtener las métricas');
    }
    return response.json();
  }
}
