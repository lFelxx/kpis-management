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
      <div className="bg-white rounded-xl shadow-lg text-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Asesores</h2>
            {!hideActions && (
              <button
                onClick={() => setIsUpdateGoalsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm font-medium"
              >
                Establecer Meta
              </button>
            )}
          </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                {!hideActions && <th className="px-6 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {advisers.map((adviser) => (
                <tr key={adviser.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{adviser.name} {adviser.lastName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-600 font-medium">
                      $ {(adviser.currentMonthSales ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-indigo-600 font-medium">${(adviser.goalValue ?? 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${adviser.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {adviser.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {!hideActions && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onEdit?.(adviser)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-xs font-semibold transition"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onSum?.(adviser)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 text-xs font-semibold transition"
                          title="Sumar"
                        >
                          Sumar
                        </button>
                        <button
                          onClick={() => onEditComparison?.(adviser)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs font-semibold transition"
                          title="Comparación"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Comparación
                        </button>
                        <button
                          onClick={() => onEditUpt?.(adviser)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs font-semibold transition"
                          title="UPT"
                        >
                          UPT
                        </button>
                        <button
                          onClick={() => onDelete?.(adviser.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 text-xs font-semibold transition"
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