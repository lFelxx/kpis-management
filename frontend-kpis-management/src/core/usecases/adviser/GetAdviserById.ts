import { Adviser } from '../../domain/Adviser/Adviser';
import { AdviserRepository } from '../../interfaces/repositories/AdviserRepository';

export class GetAdviserByIdUseCase {
  constructor(private adviserRepository: AdviserRepository) {}

  async execute(id: string): Promise<Adviser | null> {
    const adviser = await this.adviserRepository.getById(id);
    if (!id) throw new Error('El ID del asesor es requerido!');
    if (!adviser) throw new Error('Asesor no encontrado');
    return this.adviserRepository.getById(id);
  }
} 