import { create } from "zustand";
import { Adviser } from "../../../core/domain/Adviser/Adviser";
import { AdviserApiRepository } from "../../../infrastructure/api/AdviserApiRepository";
import { ToastNotificationService } from "../../../infrastructure/services/ToastNotificationService";
import { GetAdviserByIdUseCase } from "../../../core/usecases/adviser/GetAdviserById";
import { config } from "../../../config/environment";
import {
  createAdviserUseCase,
  updateAdviserUseCase,
  getAllAdvisersUseCase,
  deleteAdviserUseCase,
  getAdviserByIdUseCase,
  handleSumUseCase,
  updateGoalUseCase,
  updateMonthlySalesUseCase,
  updateAllGoalsUseCase,
  getDashboardMetricsUseCase,
} from '../../../core/instances/instances'
import { DashboardMetrics } from "../../../core/domain/Adviser/DashboardMetrics";


// Estado
interface AdvisersState {
  advisers: Adviser[];
  currentAdviser: Adviser | null;
  loading: boolean;
  error: string | null;
  metrics: DashboardMetrics | null;
}

// Acciones
interface AdvisersActions {
  fetchAdvisers: () => Promise<void>;
  fetchAdviserById: (id: string) => Promise<Adviser | null >;
  createAdviser: (adviser: Omit<Adviser, 'id'>) => Promise<Adviser>;
  updateAdviser: (id: string, data: Partial<Adviser>) => Promise<Adviser>;
  deleteAdviser: (id: string) => Promise<void>;
  incrementSales: (adviser: Adviser, value: number) => Promise<void>;
  updateGoal: (id: string, year: number, month: number, goal: number) => Promise<void>;
  updateMonthlySales: (id: string, year: number, month: number, totalSales: number) => Promise<void>;
  updateAllGoals: (year: number, month: number, goal: number) => Promise<void>;
  updateAdviserInStore: (adviser: Adviser) => void;
  selectAdviser: (id: string) => void;
  clearSelectAdviser: () => void;
  fetchDashboardMetrics: (year: number, month: number) => Promise<void>;
}

// Tipo del store
type AdvisersStore = AdvisersState & AdvisersActions;

// Instancias
const adviserRepository = new AdviserApiRepository(config.apiUrl);
const notificationService = new ToastNotificationService();



// Creación del store
export const useAdvisersStore = create<AdvisersStore>((set, get) => ({
  // Estado inicial
  advisers: [],
  metrics: null,
  currentAdviser: null,
  loading: false,
  error: null,
  getAdviserByIdUseCase: new GetAdviserByIdUseCase(adviserRepository),

  // cargar todos los asesores
  fetchAdvisers: async() => {
    set({loading: true, error: null});
    try {
      const data = await getAllAdvisersUseCase.execute();
      set({advisers: data, loading: false})
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({error: errorMessage, loading: false});
      notificationService.showError(errorMessage);
    }
  },

  
  // Seleccionar asesor por ID
  fetchAdviserById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const adviser = await getAdviserByIdUseCase.execute(id);
      if (!adviser) throw new Error("Asesor no encontrado");
      set({ currentAdviser: adviser, loading: false });
      return adviser;
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, loading: false });
      notificationService.showError(errorMessage);
      return null;
    }
  },

  // Crear asesor
  createAdviser: async (adviser) => {
    set({ loading: true, error: null });
    try {
      const adviserCreated = await createAdviserUseCase.execute(adviser);
      set((state) => ({ 
        advisers: [...state.advisers, adviserCreated],
        loading: false,
      }));
      return (adviserCreated);
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, loading: false });
      notificationService.showError(errorMessage);
      throw error;
    }
  },

  // Actualizar asesor
  updateAdviser: async (id, adviser) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateAdviserUseCase.execute(id, adviser);
      get().updateAdviserInStore(updated);
      set({ loading: false });
      return updated;
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, loading: false });
      notificationService.showError(errorMessage);
      throw error;
    }
  },

  // Eliminar asesor
  deleteAdviser: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteAdviserUseCase.execute(id);
      set((state) => ({
        advisers: state.advisers.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, loading: false });
      notificationService.showError(errorMessage);
      throw error;
    }
  },


  incrementSales: async (adviser, value) => {
    set({loading: true, error: null});
    try {
      await handleSumUseCase.execute(adviser, value);
      // Recarga la lista de asesores para reflejar los cambios
      await get().fetchAdvisers();
      set({loading: false});
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, loading: false });
      notificationService.showError(errorMessage);
      throw error;
    }
  },

  updateGoal: async (id, year, month, goal) => {
    set({ loading: true, error: null });
    try {
      await updateGoalUseCase.execute(id, year, month, goal);
      const updated = await get().fetchAdviserById(id);
      if (updated) get().updateAdviserInStore(updated);
      set({ loading: false });
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, loading: false });
      notificationService.showError(errorMessage);
      throw error;
    }
  },

  updateMonthlySales: async (adviserId, year, month, totalSales) =>{
    set({ loading: true, error: null});
    try {
      await updateMonthlySalesUseCase.execute(adviserId, year, month, totalSales);
      const updated = await get().fetchAdviserById(adviserId);
      if (updated) get().updateAdviserInStore(updated);
      set({ loading: false});
    } catch (error) {
      const errorMessage = (error as Error).message;
    set({ error: errorMessage, loading: false });
    notificationService.showError(errorMessage);
    throw error;
    }
  },

  updateAllGoals: async (year, month, goal) => {
    set({loading: true, error: null});
    try {
      await updateAllGoalsUseCase.execute(year, month, goal);
      set({loading: false});
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, loading: false });
      notificationService.showError(errorMessage);
      throw error;
    }
  },

  fetchDashboardMetrics: async (year: number, month: number) => {
    set({loading: true, error: null});
    try {
      const data = await getDashboardMetricsUseCase.execute(year, month);
      set({metrics: data, loading: false});
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, loading: false });
      notificationService.showError(errorMessage);
      throw error;
    }
  },

  
  // Utilidades

  // actualizar asesor en el estado
  updateAdviserInStore: (updated) => {
    set((state) => ({
      advisers: state.advisers.map((a) => (a.id === updated.id ? updated : a)),
      currentAdviser: 
        state.currentAdviser?.id === updated.id ? updated: state.currentAdviser,
    }));
  },

  // Seleccionar asesor por ID (desde store local)
  selectAdviser: (id) => {
    const foundAdviser = get().advisers.find((a) => a.id === id) || null;
    set({ currentAdviser: foundAdviser });
  },

  // Limpiar asesor seleccionado
  clearSelectAdviser: () => {
    set({ currentAdviser: null });
  }
}));
  