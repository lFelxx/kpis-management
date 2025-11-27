import { useEffect } from "react";
import { useAdvisersStore } from "../stores/advisers/advisers.store";
import { Adviser } from "../../core/domain/Adviser/Adviser";
import { Toaster } from 'react-hot-toast';
import { AddEditAdviserModal } from "../components/adviser/modals/AddEditAdviserModal";
import { useAdviserModalStore } from "../stores/modals/AdviserModalStore";
import { useAdviserUI } from "../hooks/useAdviserUI";
import { AdviserTable } from "../components/adviser/AdviserTable";
import { DeleteAdviserModal } from "../components/adviser/modals/DeleteAdviserModal";
import { SumSalesModal } from "../components/adviser/modals/SumSalesModal";
import { EditWeeklyComparisonModal } from "../components/adviser/modals/EditWeeklyComparisonModal";
import { EditUptModal } from "../components/adviser/modals/EditUptModal";
import { openEditComparisonModal } from "../hooks/useWeeklyComparisons";

const emptyAdviser: Adviser = {
  id: '',
  name: '',
  lastName: '',
  sales: 0,
  goalValue: 0,
  active: true,
};

export const AdvisoryTeam = () => {
  const { advisers, fetchAdvisers } = useAdvisersStore();
  const { openModal } = useAdviserModalStore();
  const { openDeleteModal, openSumModal, openUptModal } = useAdviserUI();
  // openEditComparisonModal es ahora una función independiente

  useEffect(() => {
    fetchAdvisers();
  }, [fetchAdvisers]);

  const openAddModal = () => {
    openModal(emptyAdviser);
  };

  const openEditModal = (adviser: Adviser) => {
    openModal(adviser);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <AddEditAdviserModal />

      {/* Modal Eliminar */}
      <DeleteAdviserModal />

      {/* Modal Sumar Ventas */}
      <SumSalesModal />

      {/* Modal Editar Comparación Semanal */}
      <EditWeeklyComparisonModal />

      {/* Modal Editar UPT */}
      <EditUptModal />

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Miembros del equipo</h1>
            <p className="text-gray-600 mt-2">Gestiona los miembros del equipo</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
          >
            + Agregar asesor
          </button>
        </div>

        {/* Tabla reutilizable */}
        <AdviserTable
          advisers={advisers}
          onEdit={openEditModal}
          onSum={openSumModal}
          onDelete={openDeleteModal}
          onEditComparison={openEditComparisonModal}
          onEditUpt={openUptModal}
        />
      </div>
    </div>
  );
};
