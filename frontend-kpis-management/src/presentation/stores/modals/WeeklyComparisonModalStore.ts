import { create } from "zustand";


interface WeeklyComparisonModalState {
    isOpen: boolean;
    adviserId: string | number | null;
    year: number | null;
    month: number | null;
    weekNumber: number | null;
    currentWeekSales: number;
    previousWeekSales: number;
    editingType: 'current' | 'previous' | null;
}

interface WeeklyComparisonModalActions {
    openModal: (adviserId: string | number, year: number, month: number, weekNumber: number, currentWeekSales: number, previousWeekSales: number) => void;
    closeModal: () => void;
    setEditingType: (type: 'current' | 'previous') => void;
    setCurrentWeekSales: (value: number) => void;
    setPreviousWeekSales: (value: number) => void;
}

type WeeklyComparisonModalStore = WeeklyComparisonModalState & WeeklyComparisonModalActions;

export const useWeeklyComparisonModalStore = create<WeeklyComparisonModalStore>((set) => ({
    isOpen: false,
    adviserId: null,
    year: null,
    month: null,
    weekNumber: null,
    currentWeekSales: 0,
    previousWeekSales: 0,
    editingType: null,

    openModal: (adviserId, year, month, weekNumber, currentWeekSales, previousWeekSales) =>
        set({
            isOpen: true,
            adviserId,
            year,
            month,
            weekNumber,
            currentWeekSales,
            previousWeekSales,
            editingType: null
        }),

    closeModal: () =>
        set({
            isOpen: false,
            adviserId: null,
            year: null,
            month: null,
            weekNumber: null,
            currentWeekSales: 0,
            previousWeekSales: 0,
            editingType: null
        }),

    setEditingType: (type) => set({ editingType: type}),

    setCurrentWeekSales: (value) => set({ currentWeekSales: value}),

    setPreviousWeekSales: (value) => set({ previousWeekSales: value})
}));