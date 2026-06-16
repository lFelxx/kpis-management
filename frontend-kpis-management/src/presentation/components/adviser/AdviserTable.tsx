import { Adviser } from "../../../core/domain/Adviser/Adviser";
import { useState } from "react";
import { motion } from "framer-motion";
import { UpdateAllGoalsModal } from "./modals/UpdateAllGoalsModal";

interface AdviserTableProps {
  advisers: Adviser[];
  hideActions?: boolean;
  onEdit?: (adviser: Adviser) => void;
  onDelete?: (adviserId: string) => void;
  onSum?: (adviser: Adviser) => void;
  onEditUpt?: (adviser: Adviser) => void;
}

const EMERALD = '#34d399';
const CYAN    = '#22d3ee';

export const AdviserTable = ({
  advisers,
  hideActions = false,
  onEdit,
  onDelete,
  onSum,
  onEditUpt,
}: AdviserTableProps) => {
  const [isUpdateGoalsModalOpen, setIsUpdateGoalsModalOpen] = useState<boolean>(false);

  return (
    <>
      <div
        className="overflow-hidden rounded-[1.4rem]"
        style={{
          background: 'var(--s-card)',
          border: '1px solid var(--b-line)',
        }}
      >
        {/* Header interno */}
        <div
          className="px-4 sm:px-7 pt-4 sm:pt-6 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between"
          style={{ borderBottom: '1px solid var(--b-subtle)' }}
        >
          <div>
            <span
              className="text-xs font-black uppercase tracking-[0.28em] block mb-0.5"
              style={{ color: `${CYAN}80` }}
            >
              Listado General
            </span>
            <h2 className="text-lg sm:text-2xl font-black tracking-tighter" style={{ color: 'var(--t-primary)' }}>
              Lista de Asesores
            </h2>
          </div>
          {!hideActions && (
            <button
              onClick={() => setIsUpdateGoalsModalOpen(true)}
              className="btn-primary text-sm self-start sm:self-auto"
            >
              Establecer Meta Global
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ background: 'var(--s-subtle)' }}>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'var(--t-micro)' }}>Asesor</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-left"
                  style={{ color: 'var(--t-micro)' }}>Ventas</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-left"
                  style={{ color: 'var(--t-micro)' }}>Meta</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-left"
                  style={{ color: 'var(--t-micro)' }}>Cumplimiento</th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-left"
                  style={{ color: 'var(--t-micro)' }}>Estado</th>
                {!hideActions && <th className="px-3 sm:px-6 py-3 sm:py-4" />}
              </tr>
            </thead>
            <tbody>
              {advisers.length === 0 ? (
                <tr>
                  <td colSpan={hideActions ? 5 : 6} className="px-7 py-12 text-center">
                    <p className="text-sm font-medium" style={{ color: 'var(--t-muted)' }}>
                      No hay asesores registrados.
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--t-micro)' }}>
                      Usa el botón &quot;+ Agregar asesor&quot; para crear el primero.
                    </p>
                  </td>
                </tr>
              ) : (
                advisers.map((adviser, i) => {
                  const rawProgress = adviser.goalValue
                    ? ((adviser.currentMonthSales ?? 0) / adviser.goalValue) * 100
                    : 0;
                  const progress  = Math.min(rawProgress, 100);
                  const isOnTrack = rawProgress >= 100;
                  const initials  = `${adviser.name.charAt(0)}${adviser.lastName.charAt(0)}`.toUpperCase();

                  return (
                    <motion.tr
                      key={adviser.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="group transition-colors duration-200 hover:bg-white/[0.03]"
                      style={{ borderTop: '1px solid var(--b-subtle)' }}
                    >
                      {/* Asesor */}
                      <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                            style={{
                              background: `${EMERALD}15`,
                              color: EMERALD,
                              border: `1px solid ${EMERALD}25`,
                            }}
                          >
                            {initials}
                          </div>
                          <span className="font-bold text-base group-hover:text-emerald-400 transition-colors duration-200" style={{ color: 'var(--t-secondary)' }}>
                            {adviser.name} {adviser.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Ventas */}
                      <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                        <span className="text-xs sm:text-sm font-black" style={{ color: 'var(--t-primary)', fontVariantNumeric: 'tabular-nums' }}>
                          ${(adviser.currentMonthSales ?? 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Meta */}
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                        <span className="text-sm font-bold"
                          style={{ color: 'var(--t-muted)', fontVariantNumeric: 'tabular-nums' }}>
                          ${(adviser.goalValue ?? 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Cumplimiento con barra */}
                      <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap" style={{ minWidth: 110 }}>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--b-line)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.04 + 0.2 }}
                              className="h-full rounded-full"
                              style={{
                                background: isOnTrack
                                  ? `linear-gradient(to right, ${EMERALD}, ${CYAN})`
                                  : EMERALD,
                                boxShadow: isOnTrack ? `0 0 6px ${EMERALD}50` : undefined,
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-black w-10 text-right shrink-0"
                            style={{
                              color: isOnTrack ? EMERALD : 'var(--t-muted)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {rawProgress.toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                        <span
                          className="px-2.5 py-1 text-xs font-black uppercase tracking-widest rounded-full"
                          style={adviser.active ? {
                            color: EMERALD,
                            background: `${EMERALD}12`,
                            border: `1px solid ${EMERALD}25`,
                          } : {
                            color: 'rgba(248,113,113,0.8)',
                            background: 'rgba(248,113,113,0.08)',
                            border: '1px solid rgba(248,113,113,0.2)',
                          }}
                        >
                          {adviser.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Acciones */}
                      {!hideActions && (
                        <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap text-right">
                          <div className="flex flex-wrap gap-1.5 justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => onEdit?.(adviser)}
                              className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                              style={{
                                color: 'var(--t-muted)',
                                background: 'var(--s-subtle)',
                                border: '1px solid var(--b-subtle)',
                              }}
                            >Editar</button>
                            <button
                              onClick={() => onSum?.(adviser)}
                              className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                              style={{
                                color: EMERALD,
                                background: `${EMERALD}12`,
                                border: `1px solid ${EMERALD}25`,
                              }}
                            >Sumar</button>
                            <button
                              onClick={() => onEditUpt?.(adviser)}
                              className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                              style={{
                                color: 'var(--t-muted)',
                                background: 'var(--s-subtle)',
                                border: '1px solid var(--b-subtle)',
                              }}
                            >UPT</button>
                            <button
                              onClick={() => onDelete?.(adviser.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                              style={{
                                color: 'rgba(248,113,113,0.4)',
                                background: 'rgba(248,113,113,0.05)',
                                border: '1px solid rgba(248,113,113,0.1)',
                              }}
                            >Eliminar</button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UpdateAllGoalsModal
        isOpen={isUpdateGoalsModalOpen}
        onClose={() => setIsUpdateGoalsModalOpen(false)}
      />
    </>
  );
};
