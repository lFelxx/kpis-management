import { StoreClosingPrediction } from '../../domain/Prediction/StoreClosingPrediction';
import { RiskDetection } from '../../domain/Prediction/RiskDetection';
import { AdviserPrediction } from '../../domain/Prediction/AdviserPrediction';
import { SalesPattern } from '../../domain/Prediction/SalesPattern';
import { SalesAnomaly } from '../../domain/Prediction/SalesAnomaly';

export interface PredictionRepository {
  getStoreClosing(year: number, month: number): Promise<StoreClosingPrediction>;
  getAdviserRisk(adviserId: number, year: number, month: number): Promise<RiskDetection>;
  getAdviserClosing(adviserId: number, year: number, month: number): Promise<AdviserPrediction>;
  getAdviserPatterns(adviserId: number): Promise<SalesPattern>;
  getAdviserAnomalies(adviserId: number, year: number, month: number): Promise<SalesAnomaly>;
}
