import { create } from 'zustand';

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateString(d);
}

interface ReportingDateStore {
  cutoffDate: string;
  setCutoffDate: (date: string) => void;
}

export const useReportingDateStore = create<ReportingDateStore>((set) => ({
  cutoffDate: yesterday(),
  setCutoffDate: (date) => set({ cutoffDate: date }),
}));
