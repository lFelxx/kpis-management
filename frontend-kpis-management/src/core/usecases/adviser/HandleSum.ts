import { Adviser } from "../../domain/Adviser/Adviser";
import { AdviserRepository } from "../../interfaces/repositories/AdviserRepository";


export class HandleSumUseCase {
  constructor(
    private adviserRepository: AdviserRepository,
  ) {}

  async execute(adviser: Adviser, value: number): Promise<void> {
    // Validación básica
    if (!adviser || !adviser.id) {
      throw new Error('Asesor no válido');
    }

    // Validar el valor ingresado
    if (isNaN(value)) {
      throw new Error('El valor ingresado no es un número válido');
    }

    /*
    // Calcular nueva suma
    const updatedAdviser: Adviser = {
      ...adviser,
      sales: adviser.sales + parsed,
    };
    */

    // Actualizar en backend
    await this.adviserRepository.addSale(adviser.id, value)

  }
}
