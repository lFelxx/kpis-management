import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { useAdviserUI } from "../../../hooks/useAdviserUI";
import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

export const SumSalesModal = () => {
    const {
      sumModal,
      closeSumModal,
      updateSumValue,
      handleConfirmSum
    } = useAdviserUI();

    const [tempValue, setTempValue] = useState('');

    useEffect(() => {
      setTempValue(sumModal.value);
    }, [sumModal.value, sumModal.isOpen]);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setTempValue(value);
      updateSumValue(value);
    };

    const numericValue = parseFloat(tempValue) || 0;

    return (
      <Transition appear show={sumModal.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeSumModal}>
          <Transition
            as={Fragment}
            show={sumModal.isOpen}
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
              show={sumModal.isOpen}
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
                    <DialogTitle className="text-2xl font-bold text-foreground">Sumar ventas</DialogTitle>
                    <p className="text-sm text-primary mt-1 font-semibold">
                      {sumModal.adviser?.name} {sumModal.adviser?.lastName}
                    </p>
                  </div>
                  <button
                    onClick={closeSumModal}
                    className="rounded-full p-2 bg-muted hover:bg-muted/80 transition"
                  >
                    <XMarkIcon className="h-6 w-6 text-muted-foreground" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-foreground mb-4 font-medium">
                    Ingresa el monto a sumar a las ventas del asesor:
                  </p>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Valor a sumar
                    </label>
                    <input
                      type="number"
                      value={tempValue}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground text-lg font-bold transition"
                      placeholder="Ingresa el valor"
                      min="0"
                      step="0.01"
                      autoFocus
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Formato: <span className="font-semibold text-primary">{formatCurrency(numericValue)}</span>
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                  <button
                    onClick={closeSumModal}
                    className="px-4 py-2 text-foreground bg-muted hover:bg-muted/80 rounded-lg font-semibold transition"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleConfirmSum}
                    disabled={!tempValue || numericValue <= 0}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Sumar
                  </button>
                </div>
              </DialogPanel>
            </Transition>
          </div>
        </Dialog>
      </Transition>
    );
};
