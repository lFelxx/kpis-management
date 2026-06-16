import { WeeklyComparison } from '../../domain/WeeklyComparison/WeeklyComparison';

export interface WeeklyComparisonRepository {
    generate(adviserId: string | number): Promise<WeeklyComparison>;
    updateCurrentWeek(adviserId: string | number, sales: number): Promise<void>;
    updatePreviousWeek(adviserId: string | number, sales: number): Promise<void>;
}
