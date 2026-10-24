export interface ShiftTemplate {
  id: number;
  name: string;
  startTime: string | null;
  endTime: string | null;
  color: string;
  isRest: boolean;
  hasLunch: boolean;
  sortOrder: number;
}

export interface ShiftTemplateRequest {
  name: string;
  startTime: string | null;
  endTime: string | null;
  color: string;
  isRest: boolean;
  hasLunch: boolean;
  sortOrder?: number;
}
