import { AdviserInsight } from '../../domain/Prediction/AdviserInsight';
import { PredictionRepository } from '../../interfaces/repositories/PredictionRepository';

export class GetAdviserInsightUseCase {
  constructor(private readonly predictionRepository: PredictionRepository) {}

  async execute(adviserId: number, year: number, month: number): Promise<AdviserInsight> {
    return this.predictionRepository.getAdviserInsight(adviserId, year, month);
  }
}
