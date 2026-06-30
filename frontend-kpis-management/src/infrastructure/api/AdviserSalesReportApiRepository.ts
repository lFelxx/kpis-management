import { CsvUploadResult, SalesReportPageResponse } from "../../core/domain/AdviserSalesReport/AdviserSalesReport";
import { AdviserSalesReportRepository } from "../../core/interfaces/repositories/AdviserSalesReportRepository";
import { request } from "./apiClient";

export class AdviserSalesReportApiRepository implements AdviserSalesReportRepository {
  constructor(private readonly baseUrl: string) {}

  async uploadCsvReport(file: File): Promise<CsvUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await request(
      `${this.baseUrl}/v1/adviser-sales-report/upload`,
      { method: "POST", body: formData },
      { requireAuth: true }
    );
    if (!response.ok) throw new Error("Error al procesar el archivo CSV");
    return response.json();
  }

  async getByYearAndMonth(year: number, month: number): Promise<SalesReportPageResponse> {
    const response = await request(
      `${this.baseUrl}/v1/adviser-sales-report?year=${year}&month=${month}`,
      {},
      { requireAuth: true }
    );
    if (response.status === 404) return { advisers: [], summary: emptySummary() };
    if (!response.ok) throw new Error("Error al obtener el reporte");
    return response.json();
  }
}

function emptySummary() {
  return {
    totalInvoices: 0,
    totalUnits: 0,
    totalGrossSales: 0,
    generalUpt: 0,
    storeAtv: 0,
    storeWowCurrentWeekSales: null,
    storeWowPreviousWeekSales: null,
    storeWowGrowthPercentage: null,
    bestUptAdviserId: null,
    bestUptAdviserName: null,
    bestUptValue: null,
    bestAvgPriceAdviserId: null,
    bestAvgPriceAdviserName: null,
    bestAvgPriceValue: null,
    bestAtvAdviserId: null,
    bestAtvAdviserName: null,
    bestAtvValue: null,
  };
}
