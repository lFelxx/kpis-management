import { create } from 'zustand';
import { GenerationRule, GenerationRuleRequest } from '../../../core/domain/Schedule/GenerationRule';
import { generationRuleApi } from '../../../infrastructure/api/GenerationRuleApiRepository';

interface State {
  rules: GenerationRule[];
  loading: boolean;
  saving: boolean;
}

interface Actions {
  fetchAll(): Promise<void>;
  create(req: GenerationRuleRequest): Promise<void>;
  update(id: number, req: { advisersPerDay: number; auxiliariesPerDay: number }): Promise<void>;
  remove(id: number): Promise<void>;
}

export const useGenerationRuleStore = create<State & Actions>((set, get) => ({
  rules: [],
  loading: false,
  saving: false,

  async fetchAll() {
    set({ loading: true });
    try {
      const rules = await generationRuleApi.getAll();
      set({ rules });
    } finally {
      set({ loading: false });
    }
  },

  async create(req) {
    set({ saving: true });
    try {
      const rule = await generationRuleApi.create(req);
      set({ rules: [...get().rules, rule] });
    } finally {
      set({ saving: false });
    }
  },

  async update(id, req) {
    set({ saving: true });
    try {
      const updated = await generationRuleApi.update(id, req);
      set({ rules: get().rules.map(r => r.id === id ? updated : r) });
    } finally {
      set({ saving: false });
    }
  },

  async remove(id) {
    set({ saving: true });
    try {
      await generationRuleApi.remove(id);
      set({ rules: get().rules.filter(r => r.id !== id) });
    } finally {
      set({ saving: false });
    }
  },
}));
