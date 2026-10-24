import { create } from 'zustand';
import { ShiftTemplate, ShiftTemplateRequest } from '../../../core/domain/Schedule/ShiftTemplate';
import { shiftTemplateApi } from '../../../infrastructure/api/ShiftTemplateApiRepository';
import { useScheduleStore } from './schedule.store';

interface ShiftTemplateState {
  templates: ShiftTemplate[];
  loading: boolean;
  saving: boolean;
}

interface ShiftTemplateActions {
  fetchAll(): Promise<void>;
  create(req: ShiftTemplateRequest): Promise<ShiftTemplate>;
  update(id: number, req: Partial<ShiftTemplateRequest>): Promise<void>;
  remove(id: number): Promise<void>;
}

export const useShiftTemplateStore = create<ShiftTemplateState & ShiftTemplateActions>((set, get) => ({
  templates: [],
  loading: false,
  saving: false,

  async fetchAll() {
    set({ loading: true });
    try {
      const templates = await shiftTemplateApi.getAll();
      set({ templates });
    } finally {
      set({ loading: false });
    }
  },

  async create(req) {
    set({ saving: true });
    try {
      const t = await shiftTemplateApi.create(req);
      set({ templates: [...get().templates, t] });
      return t;
    } finally {
      set({ saving: false });
    }
  },

  async update(id, req) {
    set({ saving: true });
    try {
      const updated = await shiftTemplateApi.update(id, req);
      set({ templates: get().templates.map(t => t.id === id ? updated : t) });
      // Recargar el horario activo para que los slots reflejen el netMinutes actualizado
      const scheduleStore = useScheduleStore.getState();
      if (scheduleStore.current) {
        await scheduleStore.fetchById(scheduleStore.current.id);
      }
    } finally {
      set({ saving: false });
    }
  },

  async remove(id) {
    set({ saving: true });
    try {
      await shiftTemplateApi.delete(id);
      set({ templates: get().templates.filter(t => t.id !== id) });
    } finally {
      set({ saving: false });
    }
  },
}));
