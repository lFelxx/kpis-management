import { MonthlySummary } from '../../domain/Adviser/Adviser';

export interface MonthlySummaryRepository {
    getByAdviser(adviserId: string | number, year: number): Promise<MonthlySummary[]>;
}
