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
        generateComparison } = useWeeklyComparisons(adviserId);

    if (loading) {
        return (
            <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                <div className="text-center text-destructive">
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
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                    Comparación Semanal - Semana {displayData.weekNumber}
                </h3>
                <button
                    onClick={generateComparison}
                    disabled={loading}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 
                               text-primary-foreground text-sm font-medium rounded-lg transition-colors 
                               focus:outline-none focus:ring-2 focus:ring-ring
                               disabled:cursor-not-allowed"
                >
                    {loading ? 'Generando...' : 'Generar Comparación'}
                </button>
            </div>
            
            <div className="space-y-4">
                {/* Ventas de la semana actual */}
                <div className="flex justify-between items-center p-4 bg-chart-1/10 rounded-lg border border-chart-1/30">
                    <div>
                        <p className="text-sm font-medium text-chart-1">Semana Actual</p>
                        <p className="text-2xl font-bold text-chart-1">
                            {formatSales(displayData.currentWeekSales)}
                        </p>
                    </div>
                    <ArrowTrendingUpIcon className="h-8 w-8 text-chart-1" />
                </div>

                {/* Ventas de la semana anterior */}
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg border border-border">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Semana Anterior</p>
                        <p className="text-2xl font-bold text-foreground">
                            {formatSales(displayData.previousWeekSales)}
                        </p>
                    </div>
                    <ArrowTrendingDownIcon className="h-8 w-8 text-muted-foreground" />
                </div>

                {/* Cambio porcentual y etiqueta de crecimiento/decrecimiento */}
                <div className={`flex items-center gap-2 p-4 rounded-lg border ${data ? (displayData.isPositive ? 'bg-chart-1/10 border-chart-1/30' : 'bg-destructive/10 border-destructive/30') : 'bg-muted border-border'}`}> 
                    {displayData.isPositive ? (
                        <ArrowTrendingUpIcon className="h-6 w-6 text-chart-1" />
                    ) : (
                        <ArrowTrendingDownIcon className="h-6 w-6 text-destructive" />
                    )}
                    <div>
                        <p className={`text-sm font-medium ${displayData.isPositive ? 'text-chart-1' : 'text-destructive'}`}>
                            {data ? getChangeLabel() : (displayData.previousWeekSales === 0 ? 'Sin datos previos' : 'Crecimiento')}
                        </p>
                        <p className={`text-xl font-bold ${displayData.isPositive ? 'text-chart-1' : 'text-destructive'}`}>
                            {data ? getPercentageChangeText() : (displayData.previousWeekSales === 0 ? 'N/A' : '0.0%')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparación visual elegante con barras horizontales mejoradas */}
            <div className="mt-6">
                <h4 className="text-base font-semibold text-foreground mb-4">Comparación Visual</h4>
                <div className="space-y-8 w-full">
                    {/* Semana Anterior */}
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <ClockIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-semibold text-muted-foreground">Anterior</span>
                        </div>
                        <div className="relative w-full bg-muted rounded-2xl h-8 shadow-inner overflow-hidden">
                            <div
                                className="bg-muted-foreground h-8 rounded-2xl transition-all duration-700 flex items-center justify-center"
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
                                <ArrowTrendingUpIcon className="h-5 w-5 text-chart-1" />
                            ) : (
                                <ArrowTrendingDownIcon className="h-5 w-5 text-destructive" />
                            )}
                            <span className={`text-sm font-semibold ${displayData.isPositive ? 'text-chart-1' : 'text-destructive'}`}>Actual</span>
                        </div>
                        <div className="relative w-full bg-muted rounded-2xl h-8 shadow-inner overflow-hidden">
                            <div
                                className={`h-8 rounded-2xl transition-all duration-700 flex items-center justify-center ${displayData.isPositive ? 'bg-gradient-to-r from-chart-1/80 to-chart-1 shadow-lg' : 'bg-gradient-to-r from-destructive/80 to-destructive shadow-lg'}`}
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