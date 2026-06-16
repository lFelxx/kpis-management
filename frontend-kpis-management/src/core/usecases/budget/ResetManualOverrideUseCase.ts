import { BudgetTemplateRepository } from '../../interfaces/repositories/BudgetTemplateRepository';

export class ResetManualOverrideUseCase {
  constructor(private readonly repository: BudgetTemplateRepository) {}

  async execute(year: number, month: number, date: string): Promise<void> {
    return this.repository.resetManualOverride(year, month, date);
  }
}
