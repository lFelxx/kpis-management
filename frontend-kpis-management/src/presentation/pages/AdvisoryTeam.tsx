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
import { EditUptModal } from "../components/adviser/modals/EditUptModal";

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
    <div className="p-4 sm:p-6 bg-background">
      <Toaster position="top-right" />
      <AddEditAdviserModal />

      {/* Modal Eliminar */}
      <DeleteAdviserModal />

      {/* Modal Sumar Ventas */}
      <SumSalesModal />

      {/* Modal Editar UPT */}
      <EditUptModal />

      {/* Contenido principal */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Miembros del equipo</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm">Gestiona los miembros del equipo</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-md transition-colors text-sm self-start sm:self-auto"
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
          onEditUpt={openUptModal}
        />
      </div>
    </div>
  );
};
