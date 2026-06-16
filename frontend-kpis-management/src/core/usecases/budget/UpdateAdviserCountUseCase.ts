import { BudgetTemplate } from '../../domain/BudgetTemplate/BudgetTemplate';
import { BudgetTemplateRepository } from '../../interfaces/repositories/BudgetTemplateRepository';

export class UpdateAdviserCountUseCase {
  constructor(private readonly repository: BudgetTemplateRepository) {}

  async execute(year: number, month: number, date: string, adviserCount: number): Promise<BudgetTemplate> {
    return this.repository.updateAdviserCount(year, month, date, adviserCount);
  }
}
