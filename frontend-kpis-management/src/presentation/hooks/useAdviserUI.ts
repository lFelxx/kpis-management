import { useActionModalStore } from '../stores/modals/ActionModalStore';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useReportingDateStore } from '../stores/ui/reportingDate.store';
import { handleSumUseCase, notificationService } from '../../core/instances/instances';
import { useCallback } from 'react';

export function useAdviserUI() {
    const actionModalStore = useActionModalStore();
    const advisersStore = useAdvisersStore();

    // Aplicando rerender-defer-reads: leer sumModal dentro del callback, no suscribirse
    const handleConfirmSum = useCallback(async () => {
        const { adviser, value } = actionModalStore.sumModal;
        if (!adviser) return;
        try {
            await handleSumUseCase.execute(adviser, Number(value));
            await advisersStore.fetchAdvisers(useReportingDateStore.getState().cutoffDate);
            actionModalStore.closeSumModal();
            notificationService.showSuccess('Suma aplicada exitosamente');
        } catch {
            notificationService.showError('Error al aplicar la suma');
        }
    }, [advisersStore, actionModalStore]);

    const handleConfirmDelete = useCallback(async () => {
        const { adviserId } = actionModalStore.deleteModal;
        if (!adviserId) return;
        try {
            await advisersStore.deleteAdviser(adviserId);
            actionModalStore.closeDeleteModal();
            notificationService.showSuccess('Asesor eliminado exitosamente');
        } catch {
            notificationService.showError('Error al eliminar el asesor');
        }
    }, [advisersStore, actionModalStore]);

    const handleConfirmUpt = useCallback(async () => {
        const { adviser, value } = actionModalStore.uptModal;
        if (!adviser) return;
        try {
            await advisersStore.updateAdviser(adviser.id, { ...adviser, upt: value });
            await advisersStore.fetchAdvisers(useReportingDateStore.getState().cutoffDate);
            actionModalStore.closeUptModal();
            notificationService.showSuccess('UPT actualizado exitosamente');
        } catch {
            notificationService.showError('Error al actualizar el UPT');
        }
    }, [advisersStore, actionModalStore]);

    return {
        ...actionModalStore,
        handleConfirmSum,
        handleConfirmDelete,
        handleConfirmUpt,
    };
}
