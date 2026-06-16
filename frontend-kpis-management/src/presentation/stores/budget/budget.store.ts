import { create } from 'zustand';
import { BudgetTemplate } from '../../../core/domain/BudgetTemplate/BudgetTemplate';
import {
  uploadBudgetTemplateUseCase,
  getBudgetTemplateUseCase,
  updateAdviserCountUseCase,
  resetManualOverrideUseCase,
  notificationService,
} from '../../../core/instances/instances';

interface BudgetState {
  template: BudgetTemplate | null;
  loading: boolean;
  error: string | null;
}

interface BudgetActions {
  uploadTemplate: (file: File, year: number, month: number) => Promise<void>;
  fetchTemplate: (year: number, month: number) => Promise<void>;
  updateAdviserCount: (year: number, month: number, date: string, adviserCount: number) => Promise<void>;
  resetOverride: (year: number, month: number, date: string) => Promise<void>;
  clearTemplate: () => void;
}

type BudgetStore = BudgetState & BudgetActions;

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  template: null,
  loading: false,
  error: null,

  uploadTemplate: async (file, year, month) => {
    set({ loading: true, error: null });
    try {
      const template = await uploadBudgetTemplateUseCase.execute(file, year, month);
      set({ template, loading: false });
      notificationService.showSuccess('Presupuesto cargado exitosamente');
    } catch (error) {
      const msg = (error as Error).message;
      set({ error: msg, loading: false });
      notificationService.showError(msg);
    }
  },

  fetchTemplate: async (year, month) => {
    set({ loading: true, error: null });
    try {
      const template = await getBudgetTemplateUseCase.execute(year, month);
      set({ template, loading: false });
    } catch (error) {
      const msg = (error as Error).message;
      set({ error: msg, loading: false, template: null });
    }
  },

  updateAdviserCount: async (year, month, date, adviserCount) => {
    set({ loading: true, error: null });
    try {
      const template = await updateAdviserCountUseCase.execute(year, month, date, adviserCount);
      set({ template, loading: false });
      notificationService.showSuccess('Asesores actualizados');
    } catch (error) {
      const msg = (error as Error).message;
      set({ error: msg, loading: false });
      notificationService.showError(msg);
    }
  },

  resetOverride: async (year, month, date) => {
    set({ loading: true, error: null });
    try {
      await resetManualOverrideUseCase.execute(year, month, date);
      await get().fetchTemplate(year, month);
      notificationService.showSuccess('Override manual reseteado');
    } catch (error) {
      const msg = (error as Error).message;
      set({ error: msg, loading: false });
      notificationService.showError(msg);
    }
  },

  clearTemplate: () => set({ template: null, error: null }),
}));
