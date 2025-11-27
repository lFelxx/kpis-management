import { useActionModalStore } from '../stores/modals/ActionModalStore';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { AdviserApiRepository } from '../../infrastructure/api/AdviserApiRepository';
import { ToastNotificationService } from '../../infrastructure/services/ToastNotificationService';
import { useCallback} from 'react';
import { HandleSumUseCase } from '../../core/usecases/adviser/HandleSum';
const adviserRepository = new AdviserApiRepository(import.meta.env.VITE_API_URL);
const handleSumUseCase = new HandleSumUseCase(adviserRepository);
const toastService = new ToastNotificationService();

export function useAdviserUI() {

  const actionModalStore = useActionModalStore();
  const advisersStore = useAdvisersStore();

  const handleConfirmSum = useCallback(async () => {
    const { adviser, value } = actionModalStore.sumModal;
    if (!adviser) return;

    try {
      await handleSumUseCase.execute(adviser, Number(value))
      // Actualizar el store después de la operación exitosa
      await advisersStore.fetchAdvisers();
      actionModalStore.closeSumModal();
      toastService.showSuccess('Suma aplicada exitosamente');
    } catch (error) {
      toastService.showError('Error al aplicar la suma');
    }
  }, [actionModalStore.sumModal, advisersStore, actionModalStore]);

  const handleConfirmDelete = useCallback(async () => {
    const { adviserId } = actionModalStore.deleteModal;
    if (!adviserId) return;

    try {
      await advisersStore.deleteAdviser(adviserId);
      actionModalStore.closeDeleteModal();
      toastService.showSuccess('Asesor eliminado exitosamente');
    } catch (error) {
      toastService.showError('Error al eliminar el asesor');
    }
  }, [actionModalStore.deleteModal, advisersStore, actionModalStore]);

  const handleConfirmUpt = useCallback(async () => {
    const { adviser, value } = actionModalStore.uptModal;
    if (!adviser) return;

    try {
      await advisersStore.updateAdviser(adviser.id, { ...adviser, upt: value });
      await advisersStore.fetchAdvisers();
      actionModalStore.closeUptModal();
      toastService.showSuccess('UPT actualizado exitosamente');
    } catch (error) {
      toastService.showError('Error al actualizar el UPT');
    }
  }, [actionModalStore.uptModal, advisersStore, actionModalStore]);

  return {
    // Estado de modales
    ...actionModalStore,
    
    // Acciones
    handleConfirmSum,
    handleConfirmDelete,
    handleConfirmUpt
  };
}
