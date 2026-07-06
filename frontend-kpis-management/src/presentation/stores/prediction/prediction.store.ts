import { create } from 'zustand';
import { StoreClosingPrediction } from '../../../core/domain/Prediction/StoreClosingPrediction';
import { RiskDetection } from '../../../core/domain/Prediction/RiskDetection';
import { AdviserPrediction } from '../../../core/domain/Prediction/AdviserPrediction';
import { SalesPattern } from '../../../core/domain/Prediction/SalesPattern';
import { SalesAnomaly } from '../../../core/domain/Prediction/SalesAnomaly';
import {
  getStoreClosingUseCase,
  getAdviserRiskUseCase,
  getAdviserClosingUseCase,
  getAdviserPatternsUseCase,
  getAdviserAnomaliesUseCase,
} from '../../../core/instances/instances';

interface AdviserDetailState {
  risk: RiskDetection | null;
  closing: AdviserPrediction | null;
  patterns: SalesPattern | null;
  anomalies: SalesAnomaly | null;
  loadingRisk: boolean;
  loadingClosing: boolean;
  loadingPatterns: boolean;
  loadingAnomalies: boolean;
}

interface PredictionState {
  storeClosing: StoreClosingPrediction | null;
  loading: boolean;
  error: string | null;
  selectedAdviserId: number | null;
  adviserDetail: AdviserDetailState;
}

interface PredictionActions {
  fetchStoreClosing: (year: number, month: number) => Promise<void>;
  selectAdviser: (adviserId: number | null) => void;
  fetchAdviserRisk: (adviserId: number, year: number, month: number) => Promise<void>;
  fetchAdviserClosing: (adviserId: number, year: number, month: number) => Promise<void>;
  fetchAdviserPatterns: (adviserId: number) => Promise<void>;
  fetchAdviserAnomalies: (adviserId: number, year: number, month: number) => Promise<void>;
}

type PredictionStore = PredictionState & PredictionActions;

const emptyAdviserDetail: AdviserDetailState = {
  risk: null,
  closing: null,
  patterns: null,
  anomalies: null,
  loadingRisk: false,
  loadingClosing: false,
  loadingPatterns: false,
  loadingAnomalies: false,
};

export const usePredictionStore = create<PredictionStore>((set) => ({
  storeClosing: null,
  loading: false,
  error: null,
  selectedAdviserId: null,
  adviserDetail: emptyAdviserDetail,

  fetchStoreClosing: async (year, month) => {
    set({ loading: true, error: null });
    try {
      const data = await getStoreClosingUseCase.execute(year, month);
      set({ storeClosing: data, loading: false });
    } catch {
      set({ error: 'Proyección no disponible', loading: false });
    }
  },

  selectAdviser: (adviserId) => {
    set({ selectedAdviserId: adviserId, adviserDetail: emptyAdviserDetail });
  },

  fetchAdviserRisk: async (adviserId, year, month) => {
    set((s) => ({ adviserDetail: { ...s.adviserDetail, loadingRisk: true } }));
    try {
      const risk = await getAdviserRiskUseCase.execute(adviserId, year, month);
      set((s) => ({ adviserDetail: { ...s.adviserDetail, risk, loadingRisk: false } }));
    } catch {
      set((s) => ({ adviserDetail: { ...s.adviserDetail, loadingRisk: false } }));
    }
  },

  fetchAdviserClosing: async (adviserId, year, month) => {
    set((s) => ({ adviserDetail: { ...s.adviserDetail, loadingClosing: true } }));
    try {
      const closing = await getAdviserClosingUseCase.execute(adviserId, year, month);
      set((s) => ({ adviserDetail: { ...s.adviserDetail, closing, loadingClosing: false } }));
    } catch {
      set((s) => ({ adviserDetail: { ...s.adviserDetail, loadingClosing: false } }));
    }
  },

  fetchAdviserPatterns: async (adviserId) => {
    set((s) => ({ adviserDetail: { ...s.adviserDetail, loadingPatterns: true } }));
    try {
      const patterns = await getAdviserPatternsUseCase.execute(adviserId);
      set((s) => ({ adviserDetail: { ...s.adviserDetail, patterns, loadingPatterns: false } }));
    } catch {
      set((s) => ({ adviserDetail: { ...s.adviserDetail, loadingPatterns: false } }));
    }
  },

  fetchAdviserAnomalies: async (adviserId, year, month) => {
    set((s) => ({ adviserDetail: { ...s.adviserDetail, loadingAnomalies: true } }));
    try {
      const anomalies = await getAdviserAnomaliesUseCase.execute(adviserId, year, month);
      set((s) => ({ adviserDetail: { ...s.adviserDetail, anomalies, loadingAnomalies: false } }));
    } catch {
      set((s) => ({ adviserDetail: { ...s.adviserDetail, loadingAnomalies: false } }));
    }
  },
}));
