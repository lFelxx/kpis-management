import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { useAdviserModalStore } from '../../../stores/modals/AdviserModalStore';
import { useAdvisersStore } from '../../../stores/advisers/advisers.store';
import { ToastNotificationService } from '../../../../infrastructure/services/ToastNotificationService';
import { XMarkIcon } from "@heroicons/react/24/outline";

type FormErrors = {
    name?: string;
    lastName?: string;
    sales?: string;
    goalValue?: string;
};

export const AddEditAdviserModal = () => {
    const { isOpen, form, closeModal, updateField, resetForm } = useAdviserModalStore();
    const { createAdviser, updateAdviser, updateGoal, updateMonthlySales } = useAdvisersStore();
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [tempSales, setTempSales] = useState<string>('');
    const [tempGoal, setTempGoal] = useState<string>('');
    const toastService = new ToastNotificationService();

    useEffect(() => {
        if (form.currentMonthSales !== undefined && form.currentMonthSales !== null) {
            setTempSales(form.currentMonthSales.toString());
        } else {
            setTempSales('');
        }
        if (form.goalValue !== undefined && form.goalValue !== null) {
            setTempGoal(form.goalValue.toString());
        } else {
            setTempGoal('');
        }
    }, [form.currentMonthSales, form.goalValue, isOpen]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const validate = () => {
        const errors: FormErrors = {};
        if (!form.name.trim()) errors.name = 'El nombre es requerido';
        if (!form.lastName.trim()) errors.lastName = 'El apellido es requerido';
        const salesValue = Number(tempSales) || 0;
        if (salesValue < 0) errors.sales = 'Las ventas no pueden ser negativas';
        const goalValue = Number(tempGoal) || 0;
        if (goalValue < 0) errors.goalValue = 'La meta no puede ser negativa';
        return errors;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validate();

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            console.log('monthlySummaries:', form.monthlySummaries, 'year:', year, 'month:', month);

            if (form.id) {

                // actualiza le venta del mes
                await updateMonthlySales(form.id, year, month, Number(tempSales) || 0)
                // Actualiza la meta (goal)
                await updateGoal(form.id, year, month, Number(tempGoal) || 0);

                // Actualiza los datos básicos del asesor
                await updateAdviser(form.id, form);

                toastService.showSuccess('Asesor actualizado exitosamente');
            } else {
                await createAdviser({
                    ...form,
                    sales: Number(tempSales) || 0,
                    goalValue: Number(tempGoal) || 0,
                    currentMonthSales: Number(tempSales) || 0
                });
                toastService.showSuccess('Asesor creado exitosamente');
            }
            closeModal();
            resetForm();
            setFormErrors({});
        } catch (error) {
            toastService.showError((error as Error).message);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
                <Transition
                    as={Fragment}
                    show={isOpen}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition
                            as={Fragment}
                            show={isOpen}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="bg-card rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-border">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-border">
                                    <div>
                                        <DialogTitle className="text-2xl font-bold text-foreground">
                                            {form.id ? 'Editar Asesor' : 'Agregar Asesor'}
                                        </DialogTitle>
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
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Nombre */}
                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">Nombre</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => updateField('name', e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground text-lg font-bold transition"
                                                placeholder="Nombre del asesor"
                                                required
                                            />
                                            {formErrors.name && <p className="text-sm text-destructive mt-1">{formErrors.name}</p>}
                                        </div>

                                        {/* Apellido */}
                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">Apellido</label>
                                            <input
                                                type="text"
                                                value={form.lastName}
                                                onChange={(e) => updateField('lastName', e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground text-lg font-bold transition"
                                                placeholder="Apellido del asesor"
                                                required
                                            />
                                            {formErrors.lastName && <p className="text-sm text-destructive mt-1">{formErrors.lastName}</p>}
                                        </div>

                                        {/* Ventas */}
                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">Ventas</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={tempSales}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setTempSales(value);
                                                    updateField('currentMonthSales', value === '' ? undefined : Number(value));
                                                }}
                                                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground text-lg font-bold transition"
                                                placeholder="Ventas del asesor"
                                                required
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Formato: <span className="font-semibold text-primary">{formatCurrency(Number(tempSales) || 0)}</span>
                                            </p>
                                            {formErrors.sales && <p className="text-sm text-destructive mt-1">{formErrors.sales}</p>}
                                        </div>

                                        {/* Meta */}
                                        <div className="text-left">
                                            <label className="block text-sm font-semibold text-foreground mb-2">Meta</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={tempGoal}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setTempGoal(value);
                                                    updateField('goalValue', value === '' ? undefined : Number(value));
                                                }}
                                                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground text-lg font-bold transition"
                                                placeholder="Meta del asesor"
                                                required
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Formato: <span className="font-semibold text-primary">{formatCurrency(Number(tempGoal) || 0)}</span>
                                            </p>
                                            {formErrors.goalValue && <p className="text-sm text-destructive mt-1">{formErrors.goalValue}</p>}
                                        </div>

                                        {/* Activo */}
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={form.active}
                                                onChange={(e) => updateField('active', e.target.checked)}
                                                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                                            />
                                            <label className="ml-2 block text-sm text-foreground">Activo</label>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="btn-glass"
                                            >
                                                Cerrar
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn-primary"
                                            >
                                                {form.id ? 'Actualizar' : 'Agregar'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </DialogPanel>
                        </Transition>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
