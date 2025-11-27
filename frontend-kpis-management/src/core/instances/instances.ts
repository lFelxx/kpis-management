import { AdviserApiRepository } from "../../infrastructure/api/AdviserApiRepository";
import { AdviserValidator } from "../domain/Adviser/AdviserValidator";
import { CreateAdviserUseCase } from "../usecases/adviser/CreateAdviser";
import { DeleteAdviserUseCase } from "../usecases/adviser/DeleteAdviser";
import { GetAdviserByIdUseCase } from "../usecases/adviser/GetAdviserById";
import { GetAllAdvisersUseCase } from "../usecases/adviser/GetAllAdvisers";
import { HandleSumUseCase } from "../usecases/adviser/HandleSum";
import { UpdateAdviser } from "../usecases/adviser/UpdateAdviser";
import { config } from "../../config/environment";
import { UpdateGoalUseCase } from "../usecases/adviser/UpdateGoalUseCase";
import { UpdateMonthlySalesUseCase } from "../usecases/adviser/UpdateMonthlySalesUseCase";
import { UpdateAllGoalsUseCase } from "../usecases/adviser/UpdateAllGoalsUseCase";
import { GetDashboardMetricsUseCase } from "../usecases/adviser/GetDashboardMetricsUseCase";

const adviserRepository = new AdviserApiRepository(config.apiUrl);
const adviserValidator = new AdviserValidator();

export const createAdviserUseCase = new CreateAdviserUseCase(adviserRepository, adviserValidator);
export const updateAdviserUseCase = new UpdateAdviser(adviserRepository, adviserValidator);
export const getAllAdvisersUseCase = new GetAllAdvisersUseCase(adviserRepository);
export const deleteAdviserUseCase = new DeleteAdviserUseCase(adviserRepository);
export const getAdviserByIdUseCase = new GetAdviserByIdUseCase(adviserRepository);
export const handleSumUseCase = new HandleSumUseCase(adviserRepository);
export const updateGoalUseCase =  new UpdateGoalUseCase(adviserRepository);
export const updateMonthlySalesUseCase =  new UpdateMonthlySalesUseCase(adviserRepository);
export const updateAllGoalsUseCase = new UpdateAllGoalsUseCase(adviserRepository);
export const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(adviserRepository);
