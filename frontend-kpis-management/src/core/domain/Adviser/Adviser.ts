export type TeamRole = 'ADMIN' | 'CO_ADMIN' | 'ADVISER' | 'AUXILIARY';

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  ADMIN:     'Administrador/a',
  CO_ADMIN:  'Co-administrador/a',
  ADVISER:   'Asesor/a comercial',
  AUXILIARY: 'Auxiliar operativo/a',
};

/** Roles que no aplican a metas de ventas. */
export const NON_SELLING_ROLES: TeamRole[] = ['ADMIN', 'AUXILIARY'];

export interface MonthlySummary {
  id: number;
  month: number;
  year: number;
  totalSales: number;
  createdAt?: string;
  updatedAt?: string;
}

export const REST_DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export interface Adviser {
  id: string;
  name: string;
  lastName: string;
  sales: number;
  goalValue: number;
  fullMonthGoal?: number;
  currentMonthSales?: number;
  /** Comisión del mes en curso (calculada en backend según cumplimiento de la tienda). */
  commission?: number;
  /** Tasa efectiva sobre ventas del asesor (%), misma para todos en el mes (regla de tienda). */
  commissionRatePercent?: number;
  active: boolean;
  teamRole: TeamRole;
  monthlySummaries?: MonthlySummary[];
  upt?: string;
  /** 1=lunes … 7=domingo (ISO). Null = sin día fijo. */
  restDay?: number | null;
} 