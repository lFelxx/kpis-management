import { RiskDetection } from '../../domain/Prediction/RiskDetection';
import { PredictionRepository } from '../../interfaces/repositories/PredictionRepository';

export class GetAdviserRiskUseCase {
  constructor(private readonly predictionRepository: PredictionRepository) {}

  async execute(adviserId: number, year: number, month: number): Promise<RiskDetection> {
    return this.predictionRepository.getAdviserRisk(adviserId, year, month);
  }
}
