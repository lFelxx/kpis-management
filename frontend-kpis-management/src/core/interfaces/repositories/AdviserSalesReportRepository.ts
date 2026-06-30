import { CsvUploadResult, SalesReportPageResponse } from "../../domain/AdviserSalesReport/AdviserSalesReport";

export interface AdviserSalesReportRepository {
  uploadCsvReport(file: File): Promise<CsvUploadResult>;
  getByYearAndMonth(year: number, month: number): Promise<SalesReportPageResponse>;
}
