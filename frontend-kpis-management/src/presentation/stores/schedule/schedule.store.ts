import { create } from 'zustand';
import {
  WeeklySchedule,
  WeeklyScheduleSummary,
  ScheduleSlotUpdateRequest,
  ScheduleConfig,
} from '../../../core/domain/Schedule/Schedule';
import { scheduleRepository, notificationService } from '../../../core/instances/instances';

interface ScheduleState {
  summaries: WeeklyScheduleSummary[];
  current: WeeklySchedule | null;
  config: ScheduleConfig | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

interface ScheduleActions {
  fetchAll(): Promise<void>;
  fetchById(id: number): Promise<void>;
  create(weekStart: string): Promise<void>;
  generate(id: number): Promise<void>;
  updateSlot(slotId: number, req: ScheduleSlotUpdateRequest): Promise<void>;
  publish(id: number): Promise<void>;
  unpublish(id: number): Promise<void>;
  fetchConfig(): Promise<void>;
  saveConfig(cfg: Partial<ScheduleConfig>): Promise<void>;
  clearSlots(id: number): Promise<void>;
  exportExcel(id: number, filename: string): Promise<void>;
  clearCurrent(): void;
}

export const useScheduleStore = create<ScheduleState & ScheduleActions>((set) => ({
  summaries: [],
  current: null,
  config: null,
  loading: false,
  saving: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const summaries = await scheduleRepository.getAll();
      set({ summaries, loading: false });
    } catch (e) {
      const msg = (e as Error).message;
      set({ error: msg, loading: false });
    }
  },

  fetchById: async (id) => {
    set({ loading: true, error: null });
    try {
      const current = await scheduleRepository.getById(id);
      set({ current, loading: false });
    } catch (e) {
      const msg = (e as Error).message;
      set({ error: msg, loading: false });
    }
  },

  create: async (weekStart) => {
    set({ saving: true, error: null });
    try {
      const current = await scheduleRepository.create(weekStart);
      set((s) => ({ current, summaries: [...s.summaries, { id: current.id, weekStart: current.weekStart, weekEnd: current.weekEnd, status: current.status }], saving: false }));
      notificationService.showSuccess('Horario creado');
    } catch (e) {
      const msg = (e as Error).message;
      set({ error: msg, saving: false });
      notificationService.showError(msg);
    }
  },

  generate: async (id) => {
    set({ saving: true, error: null });
    try {
      const current = await scheduleRepository.generate(id);
      set({ current, saving: false });
      notificationService.showSuccess('Horario generado automáticamente');
    } catch (e) {
      const msg = (e as Error).message;
      set({ error: msg, saving: false });
      notificationService.showError(msg);
    }
  },

  updateSlot: async (slotId, req) => {
    try {
      const updated = await scheduleRepository.updateSlot(slotId, req);
      const serverSlot = updated.slots.find(s => s.id === slotId);
      set(s => ({
        current: s.current ? {
          ...s.current,
          slots: s.current.slots.map(sl => sl.id === slotId ? (serverSlot ?? sl) : sl),
          adviserSummaries: updated.adviserSummaries,
          warnings: updated.warnings,
        } : null,
      }));
    } catch (e) {
      notificationService.showError((e as Error).message);
    }
  },

  publish: async (id) => {
    set({ saving: true });
    try {
      const current = await scheduleRepository.publish(id);
      set((s) => ({
        current,
        saving: false,
        summaries: s.summaries.map((x) => (x.id === id ? { ...x, status: 'PUBLISHED' } : x)),
      }));
      notificationService.showSuccess('Horario publicado');
    } catch (e) {
      const msg = (e as Error).message;
      set({ saving: false });
      notificationService.showError(msg);
    }
  },

  unpublish: async (id) => {
    set({ saving: true });
    try {
      const current = await scheduleRepository.unpublish(id);
      set((s) => ({
        current,
        saving: false,
        summaries: s.summaries.map((x) => (x.id === id ? { ...x, status: 'DRAFT' } : x)),
      }));
      notificationService.showSuccess('Horario desbloqueado para edición');
    } catch (e) {
      const msg = (e as Error).message;
      set({ saving: false });
      notificationService.showError(msg);
    }
  },

  fetchConfig: async () => {
    try {
      const config = await scheduleRepository.getConfig();
      set({ config });
    } catch { /* silently ignore */ }
  },

  saveConfig: async (cfg) => {
    set({ saving: true });
    try {
      const config = await scheduleRepository.saveConfig(cfg);
      set({ config, saving: false });
      notificationService.showSuccess('Configuración guardada');
    } catch (e) {
      const msg = (e as Error).message;
      set({ saving: false });
      notificationService.showError(msg);
    }
  },

  clearSlots: async (id) => {
    set({ saving: true });
    try {
      const current = await scheduleRepository.clearSlots(id);
      set({ current, saving: false });
      notificationService.showSuccess('Horario limpiado');
    } catch (e) {
      const msg = (e as Error).message;
      set({ saving: false });
      notificationService.showError(msg);
    }
  },

  exportExcel: async (id, filename) => {
    try {
      const blob = await scheduleRepository.exportExcel(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      notificationService.showError((e as Error).message);
    }
  },

  clearCurrent: () => set({ current: null }),
}));
