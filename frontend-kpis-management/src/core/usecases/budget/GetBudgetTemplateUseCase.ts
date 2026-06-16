import { BudgetTemplate } from '../../domain/BudgetTemplate/BudgetTemplate';
import { BudgetTemplateRepository } from '../../interfaces/repositories/BudgetTemplateRepository';

export class GetBudgetTemplateUseCase {
  constructor(private readonly repository: BudgetTemplateRepository) {}

  async execute(year: number, month: number): Promise<BudgetTemplate> {
    return this.repository.getByYearAndMonth(year, month);
  }
}
