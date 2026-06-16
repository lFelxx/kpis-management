import { MonthlySummary } from '../../domain/Adviser/Adviser';
import { MonthlySummaryRepository } from '../../interfaces/repositories/MonthlySummaryRepository';

export class GetMonthlySummaryUseCase {
    constructor(private readonly repo: MonthlySummaryRepository) {}

    async execute(adviserId: string | number, year: number): Promise<MonthlySummary[]> {
        if (!adviserId) throw new Error('El ID del asesor es requerido');
        if (!year) throw new Error('El año es requerido');
        return this.repo.getByAdviser(adviserId, year);
    }
}
