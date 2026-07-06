import { StoreClosingPrediction } from '../../domain/Prediction/StoreClosingPrediction';
import { PredictionRepository } from '../../interfaces/repositories/PredictionRepository';

export class GetStoreClosingUseCase {
  constructor(private readonly predictionRepository: PredictionRepository) {}

  async execute(year: number, month: number): Promise<StoreClosingPrediction> {
    return this.predictionRepository.getStoreClosing(year, month);
  }
}
