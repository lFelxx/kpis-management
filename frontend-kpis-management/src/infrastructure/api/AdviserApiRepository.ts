import { Adviser } from '../../core/domain/Adviser/Adviser';
import { DashboardMetrics } from '../../core/domain/Adviser/DashboardMetrics';
import { AdviserRepository } from '../../core/interfaces/repositories/AdviserRepository';

export class AdviserApiRepository implements AdviserRepository {

  constructor(private readonly baseUrl: string) {
    
  }

  async getAll(): Promise<Adviser[]> {
    try {
      const response = await fetch(`${this.baseUrl}/advisers`);
      if (!response.ok) {
        throw new Error('Error al obtener los asesores');
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Error en la petición: ${(error as Error).message}`);
    }
  }

  async getById(id: string): Promise<Adviser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/advisers/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Error al obtener el asesor');
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Error en la petición: ${(error as Error).message}`);
    }
  }

  async create(adviser: Omit<Adviser, 'id'>): Promise<Adviser> {
    try {
      const token = localStorage.getItem('token');

      // Prepara los headers, incluyendo Authorization si hay token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.baseUrl}/advisers`, {
        
        method: 'POST',
        headers,
        body: JSON.stringify(adviser)
      });


      if (!response.ok) {
        throw new Error('Error al crear el asesor');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error en la petición: ${(error as Error).message}`);
    }
  }

  async update(id: string, adviser: Partial<Adviser>): Promise<Adviser> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.baseUrl}/advisers/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(adviser)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Asesor no encontrado');
        }
        throw new Error('Error al actualizar el asesor');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error en la petición: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${this.baseUrl}/advisers/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Asesor no encontrado');
        }
        throw new Error('Error al eliminar el asesor');
      }
    } catch (error) {
      throw new Error(`Error en la petición: ${(error as Error).message}`);
    }
  }

  async addSale(adviserId: String, amount: number): Promise<void>{
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/sales/add`,{
      method: 'POST',
      headers,
      body: JSON.stringify({
        adviserId,
        amount,
        saleDate: (() => {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
        })()
      }),
    });
    if (!response.ok) {
      throw new Error('Error al agregar la venta');
    }
  }

  async updateGoal(adviserId: String, year: number, month: number, goal: number): Promise<void>{
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    };

    const response = await fetch(`${this.baseUrl}/goals/${adviserId}`,{
      method: 'PUT',
      headers,
      body: JSON.stringify({ year, month, goal}),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la meta');
    }
  }

  async updateMonthlySales(adviserId: string, year: number, month: number, totalSales: number): Promise<void>{
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${this.baseUrl}/monthly-summary/by-adviser/${adviserId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ year, month, totalSales}),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar las ventas');
    }
  }

  async updateAllGoals(year: number, month: number, goal: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/goals/all`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ year, month, goal }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar las metas de todos los asesores');
      }
    } catch (error) {
      throw new Error(`Error en la petición: ${(error as Error).message}`);
    }
  }

  async getDashboardMetrics(year: number, month: number): Promise<DashboardMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics/dashboard?year=${year}&month=${month}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok){
        throw new Error('Error al obtener las métricas');
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Error en la petición: ${(error as Error).message}`);
    }
  }

} 