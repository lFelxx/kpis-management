import { BudgetTemplate } from '../../domain/BudgetTemplate/BudgetTemplate';

export interface BudgetTemplateRepository {
  upload(file: File, year: number, month: number): Promise<BudgetTemplate>;
  getByYearAndMonth(year: number, month: number): Promise<BudgetTemplate>;
  updateAdviserCount(year: number, month: number, date: string, adviserCount: number): Promise<BudgetTemplate>;
  resetManualOverride(year: number, month: number, date: string): Promise<void>;
  toggleAdviserExclusion(year: number, month: number, date: string, adviserId: number): Promise<BudgetTemplate>;
}
