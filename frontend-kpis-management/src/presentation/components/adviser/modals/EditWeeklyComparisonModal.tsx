import React, { useState } from "react";
import { useWeeklyComparisonModalStore } from "../../../stores/modals/WeeklyComparisonModalStore";
import { ToastNotificationService } from "../../../../infrastructure/services/ToastNotificationService";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const EditWeeklyComparisonModal: React.FC = () => {
    const {
        isOpen,
        adviserId,
        year,
        month,
        weekNumber,
        currentWeekSales,
        previousWeekSales,
        editingType,
        closeModal,
        setEditingType,
    } = useWeeklyComparisonModalStore();

    const [isLoading, setIsLoading] = useState(false);
    const [tempCurrentSales, setTempCurrentSales] = useState(currentWeekSales);
    const [tempPreviousSales, setTempPreviousSales] = useState(previousWeekSales);
    const toastService = new ToastNotificationService();
;

    React.useEffect(() => {
        console.log('🔄 EditWeeklyComparisonModal - useEffect ejecutándose:', {
            currentWeekSales,
            previousWeekSales
        });
        setTempCurrentSales(currentWeekSales);
        setTempPreviousSales(previousWeekSales);
        console.log('✅ EditWeeklyComparisonModal - Estados temporales actualizados:', {
            tempCurrentSales: currentWeekSales,
            tempPreviousSales: previousWeekSales
        });
    }, [currentWeekSales, previousWeekSales]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!adviserId) return;

        setIsLoading(true);
        try {
            let endpoint = '';
            let payload = {};

            if (editingType === 'current') {
                endpoint = `/api/v1/weekly-comparisons/adviser/${adviserId}/current-week`;
                payload = { currentWeekSales: tempCurrentSales }
            } else if (editingType === 'previous') {
                endpoint = `/api/v1/weekly-comparisons/adviser/${adviserId}/previous-week`;
                payload = { currentWeekSales: tempPreviousSales }
            }

            console.log('💾 EditWeeklyComparisonModal - Guardando datos:', {
                adviserId,
                editingType,
                endpoint,
                payload
            });

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar las ventas');
            }

            toastService.showSuccess('Ventas actualizadas correctamente');
            closeModal();

            // Recargar la página para actualizar los datos
            
        } catch (error) {
            toastService.showError('Error al actualizar las ventas');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setTempCurrentSales(currentWeekSales);
        setTempPreviousSales(previousWeekSales);
        setEditingType(null as any);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Editar Comparación Semanal</h2>
              <p className="text-sm text-primary mt-1 font-semibold">
                Semana {weekNumber} - {month}/{year}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full p-2 bg-muted hover:bg-muted/80 transition"
            >
              <XMarkIcon className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!editingType ? (
              <div className="space-y-4">
                <p className="text-foreground mb-4 font-medium">
                  Selecciona qué valor deseas editar:
                </p>
                {/* Botón para editar semana actual */}
                <button
                  onClick={() => {
                    console.log('🎯 Botón Semana Actual clickeado - Valor mostrado:', formatCurrency(currentWeekSales));
                    setEditingType('current');
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 transition"
                >
                  <div>
                    <p className="font-semibold text-primary">Semana Actual</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(currentWeekSales)}</p>
                  </div>
                  <PencilIcon className="h-6 w-6 text-primary" />
                </button>
                {/* Botón para editar semana anterior */}
                <button
                  onClick={() => {
                    console.log('🎯 Botón Semana Anterior clickeado - Valor mostrado:', formatCurrency(previousWeekSales));
                    setEditingType('previous');
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 border-2 border-border transition"
                >
                  <div>
                    <p className="font-semibold text-foreground">Semana Anterior</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(previousWeekSales)}</p>
                  </div>
                  <PencilIcon className="h-6 w-6 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-foreground font-medium">
                  Editando ventas de la semana <span className="font-bold text-primary">{editingType === 'current' ? 'actual' : 'anterior'}</span>:
                </p>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Valor de ventas
                  </label>
                  <input
                    type="number"
                    value={editingType === 'current' ? tempCurrentSales : tempPreviousSales}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (editingType === 'current') {
                        setTempCurrentSales(value);
                      } else {
                        setTempPreviousSales(value);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground text-lg font-bold transition"
                    placeholder="Ingresa el valor"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Formato: <span className="font-semibold text-primary">{formatCurrency(editingType === 'current' ? tempCurrentSales : tempPreviousSales)}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            {editingType && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-foreground bg-muted hover:bg-muted/80 rounded-lg font-semibold transition"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={closeModal}
              className="px-4 py-2 text-foreground bg-muted hover:bg-muted/80 rounded-lg font-semibold transition"
            >
              Cerrar
            </button>
            {editingType && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
}