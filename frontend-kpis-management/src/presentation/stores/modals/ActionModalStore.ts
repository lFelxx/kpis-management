import { create } from 'zustand';
import { Adviser } from '../../../core/domain/Adviser/Adviser';

interface ActionModalState {
  deleteModal: {
    isOpen: boolean;
    adviserId: string | null;
  };
  sumModal: {
    isOpen: boolean;
    adviser: Adviser | null;
    value: string;
  };
  uptModal: {
    isOpen: boolean;
    adviser: Adviser | null;
    value: string;
  };
}

interface ActionModalActions {
  // Acciones para modal de eliminación
  openDeleteModal: (adviserId: string) => void;
  closeDeleteModal: () => void;
  
  // Acciones para modal de suma
  openSumModal: (adviser: Adviser) => void;
  closeSumModal: () => void;
  updateSumValue: (value: string) => void;
  
  // Acciones para modal de UPT
  openUptModal: (adviser: Adviser) => void;
  closeUptModal: () => void;
  updateUptValue: (value: string) => void;
}

export const useActionModalStore = create<ActionModalState & ActionModalActions>((set) => ({
  // Estado inicial
  deleteModal: {
    isOpen: false,
    adviserId: null
  },
  sumModal: {
    isOpen: false,
    adviser: null,
    value: ''
  },
  uptModal: {
    isOpen: false,
    adviser: null,
    value: ''
  },

  // Acciones
  openDeleteModal: (adviserId) => 
    set({
      deleteModal: { isOpen: true, adviserId }
    }),

  closeDeleteModal: () => 
    set({
      deleteModal: { isOpen: false, adviserId: null }
    }),

  openSumModal: (adviser) => 
    set({
      sumModal: { isOpen: true, adviser, value: '' }
    }),

  closeSumModal: () => 
    set({
      sumModal: { isOpen: false, adviser: null, value: '' }
    }),

  updateSumValue: (value) => 
    set((state) => ({
      sumModal: { ...state.sumModal, value }
    })),

  openUptModal: (adviser) => 
    set({
      uptModal: { isOpen: true, adviser, value: adviser.upt || '' }
    }),

  closeUptModal: () => 
    set({
      uptModal: { isOpen: false, adviser: null, value: '' }
    }),

  updateUptValue: (value) => 
    set((state) => ({
      uptModal: { ...state.uptModal, value }
    }))
})); 