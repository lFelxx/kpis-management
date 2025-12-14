import { create } from 'zustand';
import { Adviser} from '../../../core/domain/Adviser/Adviser';

// Extiende el tipo Adviser para incluir previousGoalValue
export type AdviserForm = Adviser & { previousGoalValue?: number };

// Definimos el tipo para el estado del modal
interface AdviserModalState {
    isOpen: boolean;
    form: AdviserForm;
    openModal: (adviser?: Adviser) => void;
    closeModal: () => void;
    updateField: (field: keyof AdviserForm, value: any) => void;
    resetForm: () => void;
    setForm: (form: AdviserForm) => void;
}

// Definimos el tipo para las acciones
interface AdviserModalActions {
    openModal: (adviser?: Adviser) => void;
    closeModal: () => void;
    updateField: (field: keyof AdviserForm, value: any) => void;
    resetForm: () => void;
    setForm: (form: AdviserForm) => void;
}

// Combinamos el estado y las acciones
type AdviserModalStore = AdviserModalState & AdviserModalActions;

// Creamos un asesor vacío con valores por defecto
const emptyAdviser: AdviserForm = {
    id: '',
    name: '',
    lastName: '',
    sales: 0,
    goalValue: 0,
    active: true,
    previousGoalValue: undefined,
    monthlySummaries: [],
};

export const useAdviserModalStore = create<AdviserModalStore>((set) => ({
    // Estado inicial
    isOpen: false,
    form: emptyAdviser,

    // Acciones
    openModal: (adviser) => {
        if (adviser) {
            set({
                isOpen: true,
                form: {
                    ...adviser,
                    previousGoalValue: adviser.goalValue,
                },
            });
        } else {
            set({ isOpen: true, form: emptyAdviser });
        }
    },

    closeModal: () => 
        set({ 
            isOpen: false 
        }),

    updateField: (field, value) => 
        set((state) => ({ 
            form: { 
                ...state.form, 
                [field]: value 
            } 
        })),

    resetForm: () => 
        set({ 
            form: emptyAdviser, 
        }),

    setForm: (form) => set({ form }),
})); 