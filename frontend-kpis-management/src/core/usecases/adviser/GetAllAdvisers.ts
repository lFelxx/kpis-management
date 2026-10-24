import { Adviser } from '../../domain/Adviser/Adviser';
import { AdviserRepository } from '../../interfaces/repositories/AdviserRepository';

export class GetAllAdvisersUseCase {
  constructor(private adviserRepository: AdviserRepository) {}

  async execute(cutoffDate: string, sellingOnly = false): Promise<Adviser[]> {
    const advisers = await this.adviserRepository.getAll(cutoffDate, sellingOnly);
    return advisers ?? [];
  }
} 