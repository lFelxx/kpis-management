import { BudgetTemplate } from '../../domain/BudgetTemplate/BudgetTemplate';
import { BudgetTemplateRepository } from '../../interfaces/repositories/BudgetTemplateRepository';

export class UploadBudgetTemplateUseCase {
  constructor(private readonly repository: BudgetTemplateRepository) {}

  async execute(file: File, year: number, month: number): Promise<BudgetTemplate> {
    return this.repository.upload(file, year, month);
  }
}
