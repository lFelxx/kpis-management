import { SalesPattern } from '../../domain/Prediction/SalesPattern';
import { PredictionRepository } from '../../interfaces/repositories/PredictionRepository';

export class GetAdviserPatternsUseCase {
  constructor(private readonly predictionRepository: PredictionRepository) {}

  async execute(adviserId: number): Promise<SalesPattern> {
    return this.predictionRepository.getAdviserPatterns(adviserId);
  }
}
