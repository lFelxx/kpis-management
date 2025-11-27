import { AdviserRepository } from "../../interfaces/repositories/AdviserRepository";

export class UpdateMonthlySalesUseCase {
    constructor(private adviserRepository: AdviserRepository){}

    async execute(adviserId: string, year: number, month: number, totalSales: number): Promise<void>{
        await this.adviserRepository.updateMonthlySales(adviserId, year, month, totalSales);
    }
}