import { AdviserPrediction } from '../../domain/Prediction/AdviserPrediction';
import { PredictionRepository } from '../../interfaces/repositories/PredictionRepository';

export class GetAdviserClosingUseCase {
  constructor(private readonly predictionRepository: PredictionRepository) {}

  async execute(adviserId: number, year: number, month: number): Promise<AdviserPrediction> {
    return this.predictionRepository.getAdviserClosing(adviserId, year, month);
  }
}
