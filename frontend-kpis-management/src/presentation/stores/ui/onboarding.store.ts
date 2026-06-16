import { create } from 'zustand';

const STORAGE_KEY = 'kpis_onboarded_v1';

interface OnboardingStore {
  visible: boolean;
  show:    () => void;
  dismiss: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  visible: !localStorage.getItem(STORAGE_KEY),
  show:    () => set({ visible: true }),
  dismiss: () => {
    localStorage.setItem(STORAGE_KEY, '1');
    set({ visible: false });
  },
}));
