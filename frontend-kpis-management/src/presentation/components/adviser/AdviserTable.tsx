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
      <div className="bg-card rounded-xl shadow-lg border border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Asesores</h2>
            {!hideActions && (
              <button
                onClick={() => setIsUpdateGoalsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow transition-colors text-sm font-medium"
              >
                Establecer Meta
              </button>
            )}
          </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ventas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Meta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                {!hideActions && <th className="px-6 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {advisers.map((adviser) => (
                <tr key={adviser.id} className="hover:bg-accent transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-foreground">{adviser.name} {adviser.lastName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-chart-4 font-medium">
                      $ {(adviser.currentMonthSales ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-primary font-medium">${(adviser.goalValue ?? 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      adviser.active 
                        ? 'bg-chart-1/20 text-chart-1 shadow-[0_2px_8px_rgba(16,185,129,0.3)]' 
                        : 'bg-destructive/20 text-destructive shadow-[0_2px_8px_rgba(239,68,68,0.2)]'
                      }`}>
                      {adviser.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {!hideActions && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onEdit?.(adviser)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-chart-3/20 text-chart-3 hover:bg-chart-3/30 shadow-[0_2px_8px_rgba(234,179,8,0.3)] hover:shadow-[0_4px_12px_rgba(234,179,8,0.4)] text-xs font-semibold transition"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onSum?.(adviser)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-chart-1/20 text-chart-1 hover:bg-chart-1/30 shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)] text-xs font-semibold transition"
                          title="Sumar"
                        >
                          Sumar
                        </button>
                        <button
                          onClick={() => onEditComparison?.(adviser)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-chart-4/20 text-chart-4 hover:bg-chart-4/30 shadow-[0_2px_8px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] text-xs font-semibold transition"
                          title="Comparación"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Comparación
                        </button>
                        <button
                          onClick={() => onEditUpt?.(adviser)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 shadow-[0_2px_8px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_12px_rgba(168,85,247,0.4)] text-xs font-semibold transition"
                          title="UPT"
                        >
                          UPT
                        </button>
                        <button
                          onClick={() => onDelete?.(adviser.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 shadow-[0_2px_8px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)] text-xs font-semibold transition"
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