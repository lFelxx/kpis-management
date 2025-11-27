import React from 'react';
import { useWeeklyComparisons } from '../../../hooks/useWeeklyComparisons';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon } from '@heroicons/react/24/outline';

interface WeeklyComparisonChartProps {
    adviserId: string | number;
}

export const WeeklyComparisonChart: React.FC<WeeklyComparisonChartProps> = ({
    adviserId
}) => {
    const { 
        data,
        loading,
        error,
        formatSales,
        getPercentageChangeText,
        getChangeLabel,
        getChangeColor,
        generateComparison } = useWeeklyComparisons(adviserId);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-red-600">
                    <p>Error al cargar comparación semanal</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // Datos por defecto cuando no hay comparaciones
    const getWeekNumber = () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    };

    const displayData = data || {
        weekNumber: getWeekNumber(),
        currentWeekSales: 0,
        previousWeekSales: 0,
        percentageChange: 0,
        isPositive: true
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Comparación Semanal - Semana {displayData.weekNumber}
                </h3>
                <button
                    onClick={generateComparison}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 
                               text-white text-sm font-medium rounded-lg transition-colors 
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                               disabled:cursor-not-allowed"
                >
                    {loading ? 'Generando...' : 'Generar Comparación'}
                </button>
            </div>
            
            <div className="space-y-4">
                {/* Ventas de la semana actual */}
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-green-800">Semana Actual</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatSales(displayData.currentWeekSales)}
                        </p>
                    </div>
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                </div>

                {/* Ventas de la semana anterior */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-800">Semana Anterior</p>
                        <p className="text-2xl font-bold text-gray-600">
                            {formatSales(displayData.previousWeekSales)}
                        </p>
                    </div>
                    <ArrowTrendingDownIcon className="h-8 w-8 text-gray-600" />
                </div>

                {/* Cambio porcentual y etiqueta de crecimiento/decrecimiento */}
                <div className={`flex items-center gap-2 p-4 rounded-lg ${data ? getChangeColor() : 'text-gray-600 bg-gray-50'}`}> 
                    {displayData.isPositive ? (
                        <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                    ) : (
                        <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                        <p className={`text-sm font-medium ${displayData.isPositive ? 'text-green-800' : 'text-red-800'}`}>
                            {data ? getChangeLabel() : (displayData.previousWeekSales === 0 ? 'Sin datos previos' : 'Crecimiento')}
                        </p>
                        <p className={`text-xl font-bold ${displayData.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {data ? getPercentageChangeText() : (displayData.previousWeekSales === 0 ? 'N/A' : '0.0%')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparación visual elegante con barras horizontales mejoradas */}
            <div className="mt-6">
                <h4 className="text-base font-semibold text-gray-800 mb-4">Comparación Visual</h4>
                <div className="space-y-8 w-full">
                    {/* Semana Anterior */}
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-600">Anterior</span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-2xl h-8 shadow-inner overflow-hidden">
                            <div
                                className="bg-gray-400 h-8 rounded-2xl transition-all duration-700 flex items-center justify-center"
                                style={{
                                    width: `${Math.max(((displayData.previousWeekSales) / Math.max(displayData.currentWeekSales, displayData.previousWeekSales, 1)) * 100, 8)}%`
                                }}
                            >
                                <span className="absolute left-1/2 -translate-x-1/2 text-xs font-bold text-white drop-shadow">
                                    {formatSales(displayData.previousWeekSales)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Semana Actual */}
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                            {displayData.isPositive ? (
                                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                            ) : (
                                <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                            )}
                            <span className={`text-sm font-semibold ${displayData.isPositive ? 'text-green-700' : 'text-red-700'}`}>Actual</span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-2xl h-8 shadow-inner overflow-hidden">
                            <div
                                className={`h-8 rounded-2xl transition-all duration-700 flex items-center justify-center ${displayData.isPositive ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg' : 'bg-gradient-to-r from-red-400 to-red-600 shadow-lg'}`}
                                style={{
                                    width: `${Math.max(((displayData.currentWeekSales) / Math.max(displayData.currentWeekSales, displayData.previousWeekSales, 1)) * 100, 8)}%`
                                }}
                            >
                                <span className="absolute left-1/2 -translate-x-1/2 text-xs font-bold text-white drop-shadow">
                                    {formatSales(displayData.currentWeekSales)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 