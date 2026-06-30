export interface AdviserSalesReport {
  adviserId: number;
  adviserName: string;
  year: number;
  month: number;
  invoiceCount: number;
  unitsSold: number;
  upt: number;
  grossSales: number;
  netSales: number;
  atv: number | null;
  avgUnitPrice: number | null;
  wowCurrentWeekSales: number | null;
  wowPreviousWeekSales: number | null;
  wowGrowthPercentage: number | null;
}

export interface SalesReportSummary {
  totalInvoices: number;
  totalUnits: number;
  totalGrossSales: number;
  generalUpt: number;
  storeAtv: number;
  storeWowCurrentWeekSales: number | null;
  storeWowPreviousWeekSales: number | null;
  storeWowGrowthPercentage: number | null;
  bestUptAdviserId: number | null;
  bestUptAdviserName: string | null;
  bestUptValue: number | null;
  bestAvgPriceAdviserId: number | null;
  bestAvgPriceAdviserName: string | null;
  bestAvgPriceValue: number | null;
  bestAtvAdviserId: number | null;
  bestAtvAdviserName: string | null;
  bestAtvValue: number | null;
}

export interface SalesReportPageResponse {
  advisers: AdviserSalesReport[];
  summary: SalesReportSummary;
}

export interface CsvUploadResult {
  processedCount: number;
  unmatchedVendors: string[];
}
