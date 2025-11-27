import { Adviser } from "../../domain/Adviser/Adviser";
import { AdviserRepository } from "../../interfaces/repositories/AdviserRepository";
import { AdviserValidator } from "../../domain/Adviser/AdviserValidator";

export class UpdateAdviser {
    constructor(
        private adviserRepository: AdviserRepository,
        private validator: AdviserValidator
    ) {}

    async execute(id: string, adviser: Partial<Adviser>): Promise<Adviser> {
        // 1. Validar ID
        if (!id) {
            throw new Error('El ID del asesor es requerido!');
        }

        // 2. Verificar si el asesor existe
        const existingAdviser = await this.adviserRepository.getById(id);
        if (!existingAdviser) {
            throw new Error('Asesor no encontrado');
        }
        
        // 3. Validar duplicidad
        const existingAdvisers = await this.adviserRepository.getAll();
        this.validator.validateDuplicate(adviser, existingAdvisers, id);

        // 4. Validar datos usando el validador
        this.validator.validateUpdate(adviser);

        // 5. Delegar al repositorio
        return this.adviserRepository.update(id, adviser);
    }
}