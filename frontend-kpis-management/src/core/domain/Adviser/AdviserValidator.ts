import { Adviser } from "./Adviser";

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export class AdviserValidator {
  validateNewAdviser(adviser: Omit<Adviser, 'id' | 'createdAt' | 'updatedAt'>): void {
    // Validaciones de campos requeridos para nuevo asesor
    if (!adviser.name?.trim()) {
      throw new Error('El nombre es requerido');
    }

    if (!adviser.lastName?.trim()) {
      throw new Error('El apellido es requerido');
    }

    // Validaciones de longitud
    if (adviser.name.length <= 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (adviser.lastName.length <= 2) {
      throw new Error('El apellido debe tener al menos 2 caracteres');
    }

    // Validaciones de números
    if (typeof adviser.sales !== 'number' || adviser.sales < 0) {
      throw new Error('Las ventas deben ser un número positivo');
    }

    if (typeof adviser.goalValue !== 'number' || adviser.goalValue <= 0) {
      throw new Error('La meta debe ser un número positivo');
    }
  }

  validateUpdate(adviser: Partial<Adviser>): void {
    // Solo validar los campos que se están actualizando
    if (adviser.name !== undefined && !adviser.name.trim()) {
      throw new Error('El nombre es requerido');
    }

    if (adviser.lastName !== undefined && !adviser.lastName.trim()) {
      throw new Error('El apellido es requerido');
    }

    if (adviser.sales !== undefined && (typeof adviser.sales !== 'number' || adviser.sales < 0)) {
      throw new Error('Las ventas deben ser un número positivo');
    }

    if (adviser.goalValue !== undefined && (typeof adviser.goalValue !== 'number' || adviser.goalValue <= 0)) {
      throw new Error('La meta debe ser un número positivo');
    }

    if (adviser.name !== undefined) {
      if (adviser.name.length <= 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }
    }

    if (adviser.lastName !== undefined) {
      if (adviser.lastName.length <= 2) {
        throw new Error('El apellido debe tener al menos 2 caracteres');
      }
    }
  }

  validateDuplicate(adviser: Partial<Adviser>, existingAdvisers: Adviser[], currentId?: string): void {
    if (!adviser.name || !adviser.lastName) return;

    const existingAdviser = existingAdvisers.find(
      a => a.id !== currentId && 
           a.name.toLowerCase() === adviser.name!.toLowerCase() && 
           a.lastName.toLowerCase() === adviser.lastName!.toLowerCase()
    );

    if (existingAdviser) {
      throw new Error('Ya existe un asesor con ese nombre y apellido');
    }
  }
} 