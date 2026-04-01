import { AdviserRepository } from '../../interfaces/repositories/AdviserRepository';

export class GetMonthlyCommissionsUseCase {
  constructor(private readonly adviserRepository: AdviserRepository) {}

  execute(adviserId: string, year: number): Promise<number[]> {
    return this.adviserRepository.getMonthlyCommissions(adviserId, year);
  }
}
