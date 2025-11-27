import { AdviserRepository } from "../../interfaces/repositories/AdviserRepository";

export class UpdateGoalUseCase {
    constructor(private adviserRepository: AdviserRepository){}

    async execute(adviserId: string, year: number, month: number, goal: number): Promise<void>{
        // Validación de adviserId
        const idStr = String(adviserId);
        if (!idStr.trim()) {
            throw new Error("El ID del asesor es obligatorio.");
        }

        // Validación de año
        const currentYear = new Date().getFullYear();
        if (!year || year < 2000 || year > currentYear + 2) {
            throw new Error("El año proporcionado no es válido.");
        }

        // Validación de mes
        if (!month || month < 1 || month > 12) {
            throw new Error("El mes debe estar entre 1 y 12.");
        }

        // Validación de goal
        if (goal == null || isNaN(goal) || goal < 0) {
            throw new Error("La meta debe ser un número mayor o igual a 0.");
        }

        await this.adviserRepository.updateGoal(adviserId, year, month, goal);
    }
}