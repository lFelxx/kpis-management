import { Adviser } from '../../domain/Adviser/Adviser';
import { AdviserRepository } from '../../interfaces/repositories/AdviserRepository';

export class GetAllAdvisersUseCase {
  constructor(private adviserRepository: AdviserRepository) {}

  async execute(): Promise<Adviser[]> {
  const advisers = await this.adviserRepository.getAll();
  
  if (!advisers.length) {
    throw new Error('No hay asesores registrados');
  }

  return advisers;
  }
} 