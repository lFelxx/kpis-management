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
  wowCurrentWeekSales: number | null;
  wowPreviousWeekSales: number | null;
  wowGrowthPercentage: number | null;
}

export interface CsvUploadResult {
  processedCount: number;
  unmatchedVendors: string[];
}
