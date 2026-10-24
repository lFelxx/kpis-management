export interface ScheduleSlot {
  id: number;
  adviserId: number;
  adviserName: string;
  teamRole: string;
  dayOfWeek: number; // 1=Lun … 7=Dom (ISO)
  startTime: string | null;  // "HH:MM:SS"
  endTime: string | null;
  isRestDay: boolean;
  netMinutes: number;
  notes: string | null;
  shiftTemplateId: number | null;
}

export interface WeeklyAdviserSummary {
  adviserId: number;
  adviserName: string;
  teamRole: string;
  restDay: number | null;
  totalNetMinutes: number;
  workedDays: number;
}

export interface WeeklySchedule {
  id: number;
  weekStart: string; // "YYYY-MM-DD"
  weekEnd: string;
  status: 'DRAFT' | 'PUBLISHED';
  slots: ScheduleSlot[];
  adviserSummaries: WeeklyAdviserSummary[];
  warnings: string[];
}

export interface WeeklyScheduleSummary {
  id: number;
  weekStart: string;
  weekEnd: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface ScheduleSlotUpdateRequest {
  startTime?: string | null;
  endTime?: string | null;
  isRestDay?: boolean;
  notes?: string | null;
  shiftTemplateId?: number | null;
}

export interface ScheduleConfig {
  id: number;
  storeOpenTime: string;
  storeCloseTime: string;
  openingShiftEnd: string;
  closingShiftStart: string;
  lunchMinutes: number;
  minOpeningsPerAdviser: number;
  advisersPerShift: number;
  defaultOpeningEnd: string;
  defaultClosingStart: string;
}

export const DAY_LABELS = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DAY_LABELS_FULL = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function formatNetTime(minutes: number): string {
  if (minutes === 0) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

/** Duración total del turno, almuerzo incluido (netMinutes es la misma duración ya sin almuerzo). */
export function grossMinutes(slot: ScheduleSlot): number {
  if (slot.isRestDay || !slot.startTime || !slot.endTime) return 0;
  return Math.max(0, toMinutes(slot.endTime) - toMinutes(slot.startTime));
}

/** "45h - 3h de almuerzo": total real del turno y cuánto de eso es almuerzo (bruto − neto). */
export function formatTotalWithLunch(grossMin: number, netMin: number): string {
  if (grossMin === 0) return '';
  const lunchMin = grossMin - netMin;
  return lunchMin > 0
    ? `${formatNetTime(grossMin)} - ${formatNetTime(lunchMin)} de almuerzo`
    : `${formatNetTime(grossMin)} - sin almuerzo`;
}

export function formatSlotTime(slot: ScheduleSlot): string {
  if (slot.isRestDay) return 'D';
  if (!slot.startTime || !slot.endTime) return '-';
  return `${fmt12h(slot.startTime)} - ${fmt12h(slot.endTime)}`;
}

function fmt12h(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}
