import { Dialog, DialogTitle } from "@headlessui/react";
import { useState } from 'react';
import { useAdvisersStore } from "../../../stores/advisers/advisers.store";
import { ToastNotificationService } from "../../../../infrastructure/services/ToastNotificationService";

interface UpdateAllGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateAllGoalsModal = ({ isOpen, onClose }: UpdateAllGoalsModalProps) => {
  const [goal, setGoal] = useState('');
  const { updateAllGoals, fetchAdvisers, loading } = useAdvisersStore();
  const toastService = new ToastNotificationService();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSetGoal = async () => {
    // Validaciones básicas de UI
    if (!goal.trim()) {
      toastService.showError('Por favor ingresa un valor para la meta');
      return;
    }

    const goalNumber = Number(goal);
    if (isNaN(goalNumber)) {
      toastService.showError('Por favor ingresa un número válido');
      return;
    }

    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      // Las validaciones de negocio se manejan en el caso de uso
      await updateAllGoals(currentYear, currentMonth, goalNumber);
      
      // Recargar la lista de asesores para reflejar los cambios
      await fetchAdvisers();
      
      toastService.showSuccess(`Meta establecida: ${formatCurrency(goalNumber)} para todos los asesores`);
      setGoal('');
      onClose();
    } catch (error) {
      // El caso de uso maneja las validaciones específicas de negocio
      const errorMessage = error instanceof Error ? error.message : 'Error al establecer la meta';
      toastService.showError(errorMessage);
    }
  };

  const handleClose = () => {
    setGoal('');
    onClose();
  };

  return (
    <Dialog as="div" className="relative z-50" onClose={handleClose} open={isOpen}>
      <div className="fixed inset-0 bg-black bg-opacity-40" aria-hidden="true" />

             <div className="fixed inset-0 flex items-center justify-center p-4">
         <div className="bg-card rounded-xl shadow-xl p-8 max-w-md w-full border border-border">
           <DialogTitle className="text-lg font-bold text-foreground mb-2">
             Establecer Meta para Todos los Asesores
           </DialogTitle>
                         <p className="text-muted-foreground mb-6">
                Ingresa el valor de la meta que se aplicará a todos los asesores para el mes actual.
              </p>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full border-2 border-border rounded-lg px-4 py-3 mb-4 bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                placeholder="Ingresa el valor de la meta"
                min={0}
                step={1000}
                autoFocus
              />
              {goal && (
                <p className="text-sm text-muted-foreground mb-4">
                  Formato: <span className="font-semibold text-primary">{formatCurrency(Number(goal) || 0)}</span>
                </p>
              )}
           <div className="flex gap-4 justify-center">
                           <button
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50"
                onClick={handleSetGoal}
                disabled={!goal || Number(goal) <= 0 || loading}
              >
                {loading ? 'Estableciendo...' : 'Establecer Meta'}
              </button>
           </div>
         </div>
       </div>
    </Dialog>
  );
};
