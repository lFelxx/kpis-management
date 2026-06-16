import { AdviserSalesReport } from "../../domain/AdviserSalesReport/AdviserSalesReport";
import { AdviserSalesReportRepository } from "../../interfaces/repositories/AdviserSalesReportRepository";

export class GetSalesReportUseCase {
  constructor(private readonly repository: AdviserSalesReportRepository) {}

  execute(year: number, month: number): Promise<AdviserSalesReport[]> {
    return this.repository.getByYearAndMonth(year, month);
  }
}
