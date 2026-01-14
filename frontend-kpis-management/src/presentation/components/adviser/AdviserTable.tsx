import { PencilIcon } from "@heroicons/react/24/outline";
import { Adviser } from "../../../core/domain/Adviser/Adviser";
import { useState } from "react";
import { UpdateAllGoalsModal } from "./modals/UpdateAllGoalsModal";

interface AdviserTableProps {
  advisers: Adviser[];
  hideActions?: boolean;
  onEdit?: (adviser: Adviser) => void;
  onDelete?: (adviserId: string) => void;
  onSum?: (adviser: Adviser) => void;
  onEditComparison?: (adviser: Adviser) => void;
  onEditUpt?: (adviser: Adviser) => void;
}

export const AdviserTable = ({
  advisers,
  hideActions = false,
  onEdit,
  onDelete,
  onSum,
  onEditComparison,
  onEditUpt,
}: AdviserTableProps) => {
  const [isUpdateGoalsModalOpen, setIsUpdateGoalsModalOpen] = useState<boolean>(false);

  return (
    <>
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-none overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Lista de Asesores</h2>
            {!hideActions && (
              <button
                onClick={() => setIsUpdateGoalsModalOpen(true)}
                className="btn-primary"
              >
                Establecer Meta Global
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Asesor</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Ventas</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Meta</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Estado</th>
                  {!hideActions && <th className="px-6 py-4"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {advisers.map((adviser) => (
                  <tr key={adviser.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {adviser.name.charAt(0)}{adviser.lastName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {adviser.name} {adviser.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        $ {(adviser.currentMonthSales ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-500 dark:text-white/60">
                        ${(adviser.goalValue ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${adviser.active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                        }`}>
                        {adviser.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {!hideActions && (
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex flex-wrap gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => onEdit?.(adviser)}
                            className="px-3 py-1 bg-white dark:bg-white/10 text-slate-600 dark:text-white/60 hover:text-emerald-600 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onSum?.(adviser)}
                            className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            title="Sumar"
                          >
                            Sumar
                          </button>
                          <button
                            onClick={() => onEditComparison?.(adviser)}
                            className="px-3 py-1 bg-white dark:bg-white/10 text-slate-600 dark:text-white/60 hover:text-cyan-500 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                            title="Comparación"
                          >
                            <PencilIcon className="h-3 w-3" />
                            Comparación
                          </button>
                          <button
                            onClick={() => onEditUpt?.(adviser)}
                            className="px-3 py-1 bg-white dark:bg-white/10 text-slate-600 dark:text-white/60 hover:text-cyan-500 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            title="UPT"
                          >
                            UPT
                          </button>
                          <button
                            onClick={() => onDelete?.(adviser.id)}
                            className="px-3 py-1 bg-red-500/5 text-red-500/40 hover:text-red-500 border border-red-500/10 hover:border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            title="Eliminar"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UpdateAllGoalsModal
        isOpen={isUpdateGoalsModalOpen}
        onClose={() => setIsUpdateGoalsModalOpen(false)}
      />
    </>
  );
};