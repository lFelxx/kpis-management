import { useState, useCallback } from 'react';
import { useAdviserMetricsStore } from '../stores/advisers/adviserMetrics.store';
import { useWeeklyComparisonModalStore } from '../stores/modals/WeeklyComparisonModalStore';
import { Adviser } from '../../core/domain/Adviser/Adviser';

export interface WeeklyComparison {
    weekNumber: number;
    currentWeekSales: number;
    previousWeekSales: number;
    percentageChange: number;
    isPositive: boolean;
}

// Constantes para endpoints
const API_ENDPOINTS = {
    WEEKLY_COMPARISONS: '/api/v1/weekly-comparisons',
    GENERATE: '/api/v1/weekly-comparisons/generate'
} as const;

export function useWeeklyComparisons(
    adviserId?: string | number
) {
    const [data, setData] = useState<WeeklyComparison | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEmpty, setIsEmpty] = useState(false);
    
    const { formatCurrency } = useAdviserMetricsStore();
    const { openModal } = useWeeklyComparisonModalStore();

    // Función para obtener datos de comparaciones usando solo el endpoint GENERATE
    const fetchWeeklyComparison = useCallback(async (currentAdviserId?: string | number) => {
        const idToUse = currentAdviserId || adviserId;
        if (!idToUse) {
            console.warn('useWeeklyComparisons: adviserId es requerido');
            return;
        }
        
        console.log('🔄 fetchWeeklyComparison ejecutándose para adviserId:', idToUse);
        setLoading(true);
        setError(null);
        setIsEmpty(false);
        
        try {
            // Usar directamente el endpoint GENERATE que devuelve los datos
            const response = await fetch(`${API_ENDPOINTS.GENERATE}/adviser/${idToUse}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const comparisonData = await response.json();
            console.log('Datos de comparación recibidos:', comparisonData);
            
            // Verificar si hay datos válidos
            if (!comparisonData || Object.keys(comparisonData).length === 0) {
                setIsEmpty(true);
                setData(null);
                return;
            }
            
            // Mapear los datos del backend al formato esperado
            const percentageChange = comparisonData.growthPercentage ?? comparisonData.percentageChange ?? 0;
            
            const comparison: WeeklyComparison = {
                weekNumber: comparisonData.weekNumber ?? 1,
                currentWeekSales: comparisonData.currentWeekSales ?? 0,
                previousWeekSales: comparisonData.previousWeekSales ?? 0,
                percentageChange,
                isPositive: percentageChange >= 0
            };
            
            setData(comparison);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Error en fetchWeeklyComparison:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para generar comparación (regeneración manual)
    const generateComparison = useCallback(async () => {
        if (!adviserId) {
            console.warn('useWeeklyComparisons: adviserId es requerido');
            return;
        }
        
        console.log('🔄 generateComparison ejecutándose para adviserId:', adviserId);
        await fetchWeeklyComparison(adviserId);
    }, [adviserId, fetchWeeklyComparison]);

    // Función para abrir modal de edición
    const openEditComparisonModal = useCallback(async (adviser: Adviser) => {
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            
            // Usar el endpoint GENERATE para obtener los datos
            const response = await fetch(`${API_ENDPOINTS.GENERATE}/adviser/${adviser.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const comparisonData = await response.json();
            
            if (comparisonData && Object.keys(comparisonData).length > 0) {
                openModal(
                    adviser.id,
                    currentYear,
                    currentMonth,
                    comparisonData.weekNumber ?? 1,
                    comparisonData.currentWeekSales ?? 0,
                    comparisonData.previousWeekSales ?? 0
                );
            } else {
                // Valores por defecto si no hay datos
                openModal(
                    adviser.id,
                    currentYear,
                    currentMonth,
                    1,
                    0,
                    0
                );
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error('Error al obtener datos de comparación:', errorMessage);
            
            // En caso de error, usar valores por defecto
            const now = new Date();
            openModal(
                adviser.id,
                now.getFullYear(),
                now.getMonth() + 1,
                1,
                0,
                0
            );
        }
    }, [openModal]);

    // Función para actualizar comparaciones
    const updateWeeklyComparison = useCallback(async (
        adviserId: string | number, 
        type: 'current' | 'previous', 
        value: number
    ) => {
        try {
            let endpoint = '';
            let payload = {};

            if (type === 'current') {
                endpoint = `${API_ENDPOINTS.WEEKLY_COMPARISONS}/adviser/${adviserId}/current-week`;
                payload = { currentWeekSales: value };
            } else if (type === 'previous') {
                endpoint = `${API_ENDPOINTS.WEEKLY_COMPARISONS}/adviser/${adviserId}/previous-week`;
                payload = { currentWeekSales: value };
            }

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar las ventas: ${response.status}`);
            }

            // Recargar los datos después de la actualización
            if (adviserId) {
                await fetchWeeklyComparison();
            }

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error('Error al actualizar comparación:', errorMessage);
            throw new Error(`Error al actualizar comparación: ${errorMessage}`);
        }
    }, [fetchWeeklyComparison, adviserId]);

    // NO HAY useEffect - la carga inicial se maneja en el componente

    // Funciones de formateo
    const formatSales = useCallback((amount: number) => {
        // Solo proteger contra valores realmente inválidos, no contra 0 válidos
        if (typeof amount !== 'number' || isNaN(amount)) return formatCurrency(0);
        return formatCurrency(amount);
    }, [formatCurrency]);
    
    const getPercentageChangeText = useCallback(() => {
        if (!data) return '';
        if (data.previousWeekSales === 0) return 'Sin comparación';
        if (typeof data.percentageChange !== 'number' || isNaN(data.percentageChange)) return 'N/A';
        const sign = data.isPositive ? '+' : '';
        return `${sign}${data.percentageChange.toFixed(1)}%`;
    }, [data]);

    const getChangeLabel = useCallback(() => {
        if (!data) return '';
        if (typeof data.previousWeekSales !== 'number' || data.previousWeekSales === 0) return 'Sin comparación';
        if (typeof data.isPositive !== 'boolean') return 'Sin datos';
        return data.isPositive ? 'Crecimiento' : 'Decrecimiento';
    }, [data]);

    const getChangeColor = useCallback(() => {
        if (!data) return 'text-gray-600 bg-gray-50';
        if (typeof data.previousWeekSales !== 'number' || data.previousWeekSales === 0) return 'text-gray-600 bg-gray-50';
        if (typeof data.isPositive !== 'boolean') return 'text-gray-600 bg-gray-50';
        return data.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
    }, [data]);

    return {
        // Datos para mostrar
        data,
        loading,
        error,
        isEmpty,
        formatSales,
        getPercentageChangeText,
        getChangeLabel,
        getChangeColor,
        
        // Acciones
        generateComparison,
        openEditComparisonModal,
        updateWeeklyComparison,
        fetchWeeklyComparison
    };
}

// Función independiente para abrir modal de edición (sin necesidad del hook completo)
export const openEditComparisonModal = async (adviser: Adviser) => {
    // Acceder al store directamente sin usar hooks
    const store = useWeeklyComparisonModalStore.getState();
    
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        // Usar el endpoint GENERATE para obtener los datos
        const response = await fetch(`${API_ENDPOINTS.GENERATE}/adviser/${adviser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const comparisonData = await response.json();
        
        if (comparisonData && Object.keys(comparisonData).length > 0) {
            store.openModal(
                adviser.id,
                currentYear,
                currentMonth,
                comparisonData.weekNumber ?? 1,
                comparisonData.currentWeekSales ?? 0,
                comparisonData.previousWeekSales ?? 0
            );
        } else {
            // Valores por defecto si no hay datos
            store.openModal(
                adviser.id,
                currentYear,
                currentMonth,
                1,
                0,
                0
            );
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al obtener datos de comparación:', errorMessage);
        
        // En caso de error, usar valores por defecto
        const now = new Date();
        store.openModal(
            adviser.id,
            now.getFullYear(),
            now.getMonth() + 1,
            1,
            0,
            0
        );
    }
};