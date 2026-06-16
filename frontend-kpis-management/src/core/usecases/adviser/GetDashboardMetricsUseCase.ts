import { DashboardMetrics } from "../../domain/Adviser/DashboardMetrics";
import { AdviserRepository } from "../../interfaces/repositories/AdviserRepository";

export class GetDashboardMetricsUseCase {
    constructor(private adviserRepository: AdviserRepository){}

    async execute(year: number, month: number, cutoffDate: string): Promise<DashboardMetrics>{
        const metrics = await this.adviserRepository.getDashboardMetrics(year, month, cutoffDate);

        if(!metrics){
            throw new Error('No se pudieron obtener las métricas');
        }

        return metrics;
    }
}