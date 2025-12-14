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
                <DialogPanel className="bg-card rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-border">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-foreground">Editar UPT</DialogTitle>
                      <p className="text-sm text-primary mt-1 font-semibold">
                        {uptModal.adviser?.name} {uptModal.adviser?.lastName}
                      </p>
                    </div>
                    <button
                      onClick={closeUptModal}
                      className="rounded-full p-2 bg-muted hover:bg-muted/80 transition"
                    >
                      <XMarkIcon className="h-6 w-6 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-foreground mb-4 font-medium">
                      Ingresa o actualiza el UPT del asesor:
                    </p>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Valor UPT
                      </label>
                      <input
                        type="text"
                        value={uptModal.value}
                        onChange={e => updateUptValue(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground text-lg font-bold transition"
                        placeholder="UPT del asesor"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                    <button
                      onClick={closeUptModal}
                      className="px-4 py-2 text-foreground bg-muted hover:bg-muted/80 rounded-lg font-semibold transition"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={handleConfirmUpt}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
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
