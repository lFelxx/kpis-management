export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function calculateProgressPercentage(current: number, goal: number): number {
    if (goal <= 0) return 0;
    return Math.min((current / goal) * 100, 100);
}

export function getProgressColor(percentage: number): string {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
}

export function calculateWeeklyGrowth(currentWeek: number, previousWeek: number): number {
    if (previousWeek <= 0) return 0;
    return ((currentWeek - previousWeek) / previousWeek) * 100;
}

export function formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`;
}
