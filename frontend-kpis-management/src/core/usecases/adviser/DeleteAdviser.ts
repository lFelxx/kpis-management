import { AdviserRepository } from "../../interfaces/repositories/AdviserRepository";

export class DeleteAdviserUseCase {
    constructor(private adviserRepository: AdviserRepository){}

    async execute(id: string): Promise<void>{
        if (!id) throw new Error('El ID del asesor es requerido!');
        return this.adviserRepository.delete(id);
    }
}
