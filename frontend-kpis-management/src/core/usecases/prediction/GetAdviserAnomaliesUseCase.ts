import { SalesAnomaly } from '../../domain/Prediction/SalesAnomaly';
import { PredictionRepository } from '../../interfaces/repositories/PredictionRepository';

export class GetAdviserAnomaliesUseCase {
  constructor(private readonly predictionRepository: PredictionRepository) {}

  async execute(adviserId: number, year: number, month: number): Promise<SalesAnomaly> {
    return this.predictionRepository.getAdviserAnomalies(adviserId, year, month);
  }
}
