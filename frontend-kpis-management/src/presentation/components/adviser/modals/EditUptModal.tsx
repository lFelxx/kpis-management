import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { useAdviserUI } from "../../../hooks/useAdviserUI";
import { Fragment } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

export const EditUptModal = () => {
    const {
      uptModal,
      closeUptModal,
      updateUptValue,
      handleConfirmUpt
    } = useAdviserUI();

    return (
        <Transition appear show={uptModal.isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeUptModal}>
            <Transition
              as={Fragment}
              show={uptModal.isOpen}
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
                show={uptModal.isOpen}
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
                      <DialogTitle className="text-2xl font-bold text-gray-900">Editar UPT</DialogTitle>
                      <p className="text-sm text-indigo-600 mt-1 font-semibold">
                        {uptModal.adviser?.name} {uptModal.adviser?.lastName}
                      </p>
                    </div>
                    <button
                      onClick={closeUptModal}
                      className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-700" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-700 mb-4 font-medium">
                      Ingresa o actualiza el UPT del asesor:
                    </p>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valor UPT
                      </label>
                      <input
                        type="text"
                        value={uptModal.value}
                        onChange={e => updateUptValue(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50 text-gray-900 text-lg font-bold transition"
                        placeholder="UPT del asesor"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                    <button
                      onClick={closeUptModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={handleConfirmUpt}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                      Guardar
                    </button>
                  </div>
                </DialogPanel>
              </Transition>
            </div>
          </Dialog>
        </Transition>
      );
};
