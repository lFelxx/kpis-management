import { AdviserRepository } from "../../interfaces/repositories/AdviserRepository";

export class UpdateAllGoalsUseCase {
    constructor(private adviserRepository: AdviserRepository){}

    async execute(year: number, month: number, goal: number): Promise<void>{
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

        // Validación adicional: verificar que la meta no sea excesivamente baja
        if (goal < 2000000) { // 20 millones como límite razonable
            throw new Error("La meta no puede ser menor a 2,000,000.");
        }

        await this.adviserRepository.updateAllGoals(year, month, goal);
    }
}
