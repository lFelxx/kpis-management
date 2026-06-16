import { CsvUploadResult } from "../../domain/AdviserSalesReport/AdviserSalesReport";
import { AdviserSalesReportRepository } from "../../interfaces/repositories/AdviserSalesReportRepository";

export class UploadSalesReportUseCase {
  constructor(private readonly repository: AdviserSalesReportRepository) {}

  execute(file: File): Promise<CsvUploadResult> {
    return this.repository.uploadCsvReport(file);
  }
}
