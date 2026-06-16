import { Adviser } from '../../domain/Adviser/Adviser';
import { DashboardMetrics } from '../../domain/Adviser/DashboardMetrics';

export interface AdviserRepository {
  getAll(cutoffDate: string): Promise<Adviser[]>;
  getById(id: string): Promise<Adviser | null>;
  create(adviser: Omit<Adviser, 'id' | 'createdAt' | 'updatedAt'>): Promise<Adviser>;
  update(id: string, adviser: Partial<Adviser>): Promise<Adviser>;
  delete(id: string): Promise<void>;
  addSale(id: string, amount: number): Promise<void>;
  updateGoal(id: string, year: number, month: number, goal: number): Promise<void>;
  updateMonthlySales(id: string, year: number, month: number, totalSales: number ): Promise<void>;
  updateAllGoals(year: number, month: number, goal: number): Promise<void>;
  getDashboardMetrics(year: number, month: number, cutoffDate: string): Promise<DashboardMetrics>;
  getMonthlyCommissions(adviserId: string, year: number): Promise<number[]>;
} 