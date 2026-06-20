import { BudgetTemplate } from '../../domain/BudgetTemplate/BudgetTemplate';
import { BudgetTemplateRepository } from '../../interfaces/repositories/BudgetTemplateRepository';

export class ToggleAdviserExclusionUseCase {
  constructor(private readonly repository: BudgetTemplateRepository) {}

  execute(year: number, month: number, date: string, adviserId: number): Promise<BudgetTemplate> {
    return this.repository.toggleAdviserExclusion(year, month, date, adviserId);
  }
}
