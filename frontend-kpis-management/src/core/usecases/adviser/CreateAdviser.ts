import { Adviser } from '../../domain/Adviser/Adviser';
import { AdviserRepository } from '../../interfaces/repositories/AdviserRepository';
import { AdviserValidator } from '../../domain/Adviser/AdviserValidator';

export class CreateAdviserUseCase {
  constructor(
    private adviserRepository: AdviserRepository,
    private validator: AdviserValidator
  ) {}

  async execute(adviser: Omit<Adviser, 'id'>): Promise<Adviser> {

    // Validar usando el validador
    this.validator.validateNewAdviser(adviser);

    // Validando duplicidad
    const existingAdvisers = await this.adviserRepository.getAll();
    this.validator.validateDuplicate(adviser, existingAdvisers);
    
    // Delegar al repositorio
    return this.adviserRepository.create(adviser);


  }
} 