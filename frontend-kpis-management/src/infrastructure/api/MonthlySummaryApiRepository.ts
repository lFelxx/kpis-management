import { MonthlySummary } from '../../core/domain/Adviser/Adviser';
import { MonthlySummaryRepository } from '../../core/interfaces/repositories/MonthlySummaryRepository';
import { request } from './apiClient';

export class MonthlySummaryApiRepository implements MonthlySummaryRepository {
    constructor(private readonly baseUrl: string) {}

    async getByAdviser(adviserId: string | number, year: number): Promise<MonthlySummary[]> {
        const response = await request(
            `${this.baseUrl}/monthly-summary/adviser/${adviserId}?year=${year}`,
            { method: 'GET' },
            { requireAuth: true }
        );
        if (!response.ok) throw new Error('Error al obtener el resumen mensual');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    }
}
