import { create } from "zustand";
import { AdviserSalesReport, CsvUploadResult, SalesReportSummary } from "../../../core/domain/AdviserSalesReport/AdviserSalesReport";
import {
  uploadSalesReportUseCase,
  getSalesReportUseCase,
  notificationService,
} from "../../../core/instances/instances";

interface SalesReportState {
  reports: AdviserSalesReport[];
  summary: SalesReportSummary | null;
  lastUploadResult: CsvUploadResult | null;
  loading: boolean;
  uploadCsvReport: (file: File) => Promise<void>;
  fetchReports: (year: number, month: number) => Promise<void>;
  clearUploadResult: () => void;
}

export const useSalesReportStore = create<SalesReportState>((set) => ({
  reports: [],
  summary: null,
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
      const { advisers, summary } = await getSalesReportUseCase.execute(year, month);
      set({ reports: advisers, summary, loading: false });
    } catch (error) {
      const msg = (error as Error).message;
      set({ reports: [], summary: null, loading: false });
      notificationService.showError(msg);
    }
  },

  clearUploadResult: () => set({ lastUploadResult: null }),
}));
