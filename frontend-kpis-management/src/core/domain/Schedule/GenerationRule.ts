export interface GenerationRule {
  id: number;
  shiftTemplateId: number;
  shiftTemplateName: string;
  shiftTemplateColor: string;
  startTime: string | null;
  endTime: string | null;
  advisersPerDay: number;
  auxiliariesPerDay: number;
  sortOrder: number;
}

export interface GenerationRuleRequest {
  shiftTemplateId: number;
  advisersPerDay: number;
  auxiliariesPerDay: number;
  sortOrder?: number;
}
