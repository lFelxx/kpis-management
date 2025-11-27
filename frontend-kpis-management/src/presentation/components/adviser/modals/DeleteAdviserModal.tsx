import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { useAdviserUI } from "../../../hooks/useAdviserUI";
import { Fragment } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

export const DeleteAdviserModal = () => {
    const {
      deleteModal,
      closeDeleteModal,
      handleConfirmDelete,
    } = useAdviserUI();

    return (
        <Transition appear show={deleteModal.isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeDeleteModal}>
            <Transition
              as={Fragment}
              show={deleteModal.isOpen}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-40" />
            </Transition>
    
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition
                as={Fragment}
                show={deleteModal.isOpen}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        ¿Eliminar asesor?
                      </DialogTitle>
                    </div>
                    <button
                      onClick={closeDeleteModal}
                      className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-700" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-700 font-medium">
                      Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este asesor?
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                    <button
                      onClick={closeDeleteModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </DialogPanel>
              </Transition>
            </div>
          </Dialog>
        </Transition>
      );
}
