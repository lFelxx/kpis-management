export interface MonthlySummary {
  id: number;
  month: number;
  year: number;
  totalSales: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Adviser {
  id: string;
  name: string;
  lastName: string;
  sales: number;
  goalValue: number;
  currentMonthSales?: number;
  /** Comisión del mes en curso (calculada en backend según cumplimiento de la tienda). */
  commission?: number;
  /** Tasa efectiva sobre ventas del asesor (%), misma para todos en el mes (regla de tienda). */
  commissionRatePercent?: number;
  active: boolean;
  monthlySummaries?: MonthlySummary[];
  upt?: string;
} 