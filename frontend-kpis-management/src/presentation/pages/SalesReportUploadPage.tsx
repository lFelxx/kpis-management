import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import { useSalesReportStore } from '../stores/salesReport/salesReport.store';
import { AdviserSalesReport } from '../../core/domain/AdviserSalesReport/AdviserSalesReport';

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatCurrency(value: number): string {
  return '$ ' + new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.trunc(value));
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}
    >
      <p className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: 'var(--t-micro)' }}>
        {label}
      </p>
      <p className="text-lg font-black" style={{ color: 'var(--t-primary)' }}>{value}</p>
    </div>
  );
}

function UnmatchedVendorsAlert({ vendors }: { vendors: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 flex gap-3"
      style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
    >
      <FaExclamationTriangle size={16} className="shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
      <div>
        <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>
          {vendors.length} vendedor{vendors.length > 1 ? 'es' : ''} sin coincidencia
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
          Los siguientes nombres del CSV no coinciden con ningún asesor registrado:
        </p>
        <ul className="mt-2 space-y-0.5">
          {vendors.map((v) => (
            <li key={v} className="text-xs font-mono" style={{ color: 'var(--t-secondary)' }}>
              • {v}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function UploadSuccessBanner({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
    >
      <FaCheckCircle size={16} style={{ color: '#34d399' }} />
      <p className="text-sm font-semibold" style={{ color: '#34d399' }}>
        {count} asesor{count !== 1 ? 'es' : ''} actualizados correctamente
      </p>
    </motion.div>
  );
}

function ReportsTable({ reports }: { reports: AdviserSalesReport[] }) {
  const headers = ['Asesor', 'Facturas', 'Unidades', 'UPT', 'Ventas Brutas', 'Ventas Netas'];

  const totals = reports.reduce(
    (acc, r) => ({
      invoiceCount: acc.invoiceCount + r.invoiceCount,
      unitsSold: acc.unitsSold + r.unitsSold,
      grossSales: acc.grossSales + r.grossSales,
      netSales: acc.netSales + r.netSales,
    }),
    { invoiceCount: 0, unitsSold: 0, grossSales: 0, netSales: 0 }
  );
  const totalUpt = totals.invoiceCount > 0 ? totals.unitsSold / totals.invoiceCount : 0;

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ border: '1px solid var(--b-line)', background: 'var(--s-card)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--b-subtle)', background: 'var(--s-subtle)' }}>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider"
                  style={{ color: 'var(--t-micro)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map((report, i) => (
              <motion.tr
                key={report.adviserId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                style={{ borderBottom: '1px solid var(--b-subtle)' }}
              >
                <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--t-primary)' }}>{report.adviserName}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--t-secondary)' }}>{report.invoiceCount}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--t-secondary)' }}>{report.unitsSold}</td>
                <td className="px-5 py-3.5 font-semibold" style={{ color: '#22d3ee' }}>
                  {report.upt.toFixed(2)}
                </td>
                <td className="px-5 py-3.5 font-semibold" style={{ color: '#34d399' }}>
                  {formatCurrency(report.grossSales)}
                </td>
                <td className="px-5 py-3.5" style={{ color: 'var(--t-secondary)' }}>
                  {formatCurrency(report.netSales)}
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid var(--b-line)', background: 'var(--s-subtle)' }}>
              <td className="px-5 py-3.5 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--t-muted)' }}>
                Total
              </td>
              <td className="px-5 py-3.5 font-black" style={{ color: 'var(--t-primary)' }}>{totals.invoiceCount}</td>
              <td className="px-5 py-3.5 font-black" style={{ color: 'var(--t-primary)' }}>{totals.unitsSold}</td>
              <td className="px-5 py-3.5 font-black" style={{ color: '#22d3ee' }}>{totalUpt.toFixed(2)}</td>
              <td className="px-5 py-3.5 font-black" style={{ color: '#34d399' }}>{formatCurrency(totals.grossSales)}</td>
              <td className="px-5 py-3.5 font-black" style={{ color: 'var(--t-secondary)' }}>{formatCurrency(totals.netSales)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export const SalesReportUploadPage = () => {
  const { reports, lastUploadResult, loading, uploadCsvReport, fetchReports, clearUploadResult } =
    useSalesReportStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    fetchReports(year, month);
  }, [year, month]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadCsvReport(file);
    await fetchReports(year, month);
    e.target.value = '';
  };

  const totalGross = reports.reduce((s, r) => s + r.grossSales, 0);
  const totalUnits = reports.reduce((s, r) => s + r.unitsSold, 0);
  const totalInvoices = reports.reduce((s, r) => s + r.invoiceCount, 0);
  const totalUpt = totalInvoices > 0 ? totalUnits / totalInvoices : 0;

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter mb-1" style={{ color: 'var(--t-primary)' }}>
          Reporte de Ventas
        </h1>
        <p className="text-sm" style={{ color: 'var(--t-muted)' }}>
          Sube el CSV del sistema POS para registrar las ventas por asesor
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}
        >
          <FaCalendarAlt style={{ color: '#34d399' }} />
          <select
            value={month}
            onChange={(e) => { setMonth(Number(e.target.value)); clearUploadResult(); }}
            className="bg-transparent text-sm font-semibold outline-none cursor-pointer"
            style={{ color: 'var(--t-primary)' }}
          >
            {MONTH_NAMES.slice(1).map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => { setYear(Number(e.target.value)); clearUploadResult(); }}
            className="bg-transparent text-sm font-semibold outline-none w-16 text-center"
            style={{ color: 'var(--t-primary)' }}
            min={2020}
            max={2100}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold cursor-pointer disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg, #34d399, #22d3ee)', color: '#000' }}
        >
          <FaUpload size={14} />
          {loading ? 'Procesando...' : 'Subir CSV'}
        </motion.button>
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Feedback de carga */}
      <AnimatePresence>
        {lastUploadResult && (
          <div className="mb-6 space-y-3">
            {lastUploadResult.processedCount > 0 && (
              <UploadSuccessBanner count={lastUploadResult.processedCount} />
            )}
            {lastUploadResult.unmatchedVendors.length > 0 && (
              <UnmatchedVendorsAlert vendors={lastUploadResult.unmatchedVendors} />
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Summary cards */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Ventas brutas" value={formatCurrency(totalGross)} />
          <SummaryCard label="Total facturas" value={totalInvoices.toString()} />
          <SummaryCard label="Total unidades" value={totalUnits.toString()} />
          <SummaryCard label="UPT general" value={totalUpt.toFixed(2)} />
        </div>
      )}

      {/* Loading */}
      {loading && reports.length === 0 && (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-12 text-center"
          style={{ background: 'var(--s-subtle)', border: '1px dashed var(--b-line)' }}
        >
          <FaFileAlt size={32} className="mx-auto mb-4" style={{ color: 'var(--t-micro)' }} />
          <p className="text-base font-semibold" style={{ color: 'var(--t-muted)' }}>
            No hay ventas para {MONTH_NAMES[month]} {year}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--t-micro)' }}>
            Sube el CSV del sistema POS para comenzar
          </p>
        </motion.div>
      )}

      {/* Table */}
      {reports.length > 0 && <ReportsTable reports={reports} />}
    </div>
  );
};
