import { create } from "zustand";
import { AdviserSalesReport, CsvUploadResult } from "../../../core/domain/AdviserSalesReport/AdviserSalesReport";
import {
  uploadSalesReportUseCase,
  getSalesReportUseCase,
  notificationService,
} from "../../../core/instances/instances";

interface SalesReportState {
  reports: AdviserSalesReport[];
  lastUploadResult: CsvUploadResult | null;
  loading: boolean;
  uploadCsvReport: (file: File) => Promise<void>;
  fetchReports: (year: number, month: number) => Promise<void>;
  clearUploadResult: () => void;
}

export const useSalesReportStore = create<SalesReportState>((set) => ({
  reports: [],
  lastUploadResult: null,
  loading: false,

  uploadCsvReport: async (file) => {
    set({ loading: true, lastUploadResult: null });
    try {
      const result = await uploadSalesReportUseCase.execute(file);
      set({ lastUploadResult: result, loading: false });
      notificationService.showSuccess(`${result.processedCount} asesores actualizados`);
    } catch (error) {
      const msg = (error as Error).message;
      set({ loading: false });
      notificationService.showError(msg);
    }
  },

  fetchReports: async (year, month) => {
    set({ loading: true });
    try {
      const reports = await getSalesReportUseCase.execute(year, month);
      set({ reports, loading: false });
    } catch (error) {
      const msg = (error as Error).message;
      set({ reports: [], loading: false });
      notificationService.showError(msg);
    }
  },

  clearUploadResult: () => set({ lastUploadResult: null }),
}));
