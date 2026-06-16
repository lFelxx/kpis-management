import { AdviserApiRepository } from "../../infrastructure/api/AdviserApiRepository";
import { AdviserSalesReportApiRepository } from "../../infrastructure/api/AdviserSalesReportApiRepository";
import { BudgetTemplateApiRepository } from "../../infrastructure/api/BudgetTemplateApiRepository";
import { AuthApiRepositoryHttp } from "../../infrastructure/api/AuthApiRepositoryHttp";
import { MonthlySummaryApiRepository } from "../../infrastructure/api/MonthlySummaryApiRepository";
import { ToastNotificationService } from "../../infrastructure/services/ToastNotificationService";
import { AdviserValidator } from "../domain/Adviser/AdviserValidator";
import { config } from "../../config/environment";

// Adviser use cases
import { CreateAdviserUseCase } from "../usecases/adviser/CreateAdviser";
import { DeleteAdviserUseCase } from "../usecases/adviser/DeleteAdviser";
import { GetAdviserByIdUseCase } from "../usecases/adviser/GetAdviserById";
import { GetAllAdvisersUseCase } from "../usecases/adviser/GetAllAdvisers";
import { HandleSumUseCase } from "../usecases/adviser/HandleSum";
import { UpdateAdviser } from "../usecases/adviser/UpdateAdviser";
import { UpdateGoalUseCase } from "../usecases/adviser/UpdateGoalUseCase";
import { UpdateMonthlySalesUseCase } from "../usecases/adviser/UpdateMonthlySalesUseCase";
import { UpdateAllGoalsUseCase } from "../usecases/adviser/UpdateAllGoalsUseCase";
import { GetDashboardMetricsUseCase } from "../usecases/adviser/GetDashboardMetricsUseCase";
import { GetMonthlyCommissionsUseCase } from "../usecases/adviser/GetMonthlyCommissionsUseCase";

// Auth use cases
import { LoginUseCase } from "../usecases/auth/LoginUseCase";
import { LogoutUseCase } from "../usecases/auth/LogoutUseCase";
import { GetCurrentUserUseCase } from "../usecases/auth/GetCurrentUserUseCase";

// Monthly summary use cases
import { GetMonthlySummaryUseCase } from "../usecases/monthlySummary/GetMonthlySummaryUseCase";

// Adviser sales report use cases
import { UploadSalesReportUseCase } from "../usecases/adviserSalesReport/UploadSalesReportUseCase";
import { GetSalesReportUseCase } from "../usecases/adviserSalesReport/GetSalesReportUseCase";

// Budget template use cases
import { UploadBudgetTemplateUseCase } from "../usecases/budget/UploadBudgetTemplateUseCase";
import { GetBudgetTemplateUseCase } from "../usecases/budget/GetBudgetTemplateUseCase";
import { UpdateAdviserCountUseCase } from "../usecases/budget/UpdateAdviserCountUseCase";
import { ResetManualOverrideUseCase } from "../usecases/budget/ResetManualOverrideUseCase";

// ─── Repositories ────────────────────────────────────────────────────────────
const adviserRepository = new AdviserApiRepository(config.apiUrl);
const authRepository = new AuthApiRepositoryHttp(config.apiUrl);
const monthlySummaryRepository = new MonthlySummaryApiRepository(config.apiUrl);
const budgetTemplateRepository = new BudgetTemplateApiRepository(config.apiUrl);
const adviserSalesReportRepository = new AdviserSalesReportApiRepository(config.apiUrl);

// ─── Services ────────────────────────────────────────────────────────────────
export const notificationService = new ToastNotificationService();
const adviserValidator = new AdviserValidator();

// ─── Adviser use cases ───────────────────────────────────────────────────────
export const createAdviserUseCase = new CreateAdviserUseCase(adviserRepository, adviserValidator);
export const updateAdviserUseCase = new UpdateAdviser(adviserRepository, adviserValidator);
export const getAllAdvisersUseCase = new GetAllAdvisersUseCase(adviserRepository);
export const deleteAdviserUseCase = new DeleteAdviserUseCase(adviserRepository);
export const getAdviserByIdUseCase = new GetAdviserByIdUseCase(adviserRepository);
export const handleSumUseCase = new HandleSumUseCase(adviserRepository);
export const updateGoalUseCase = new UpdateGoalUseCase(adviserRepository);
export const updateMonthlySalesUseCase = new UpdateMonthlySalesUseCase(adviserRepository);
export const updateAllGoalsUseCase = new UpdateAllGoalsUseCase(adviserRepository);
export const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(adviserRepository);
export const getMonthlyCommissionsUseCase = new GetMonthlyCommissionsUseCase(adviserRepository);

// ─── Auth use cases ──────────────────────────────────────────────────────────
export const loginUseCase = new LoginUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

// ─── Monthly summary use cases ───────────────────────────────────────────────
export const getMonthlySummaryUseCase = new GetMonthlySummaryUseCase(monthlySummaryRepository);

// ─── Budget template use cases ───────────────────────────────────────────────
export const uploadBudgetTemplateUseCase = new UploadBudgetTemplateUseCase(budgetTemplateRepository);
export const getBudgetTemplateUseCase = new GetBudgetTemplateUseCase(budgetTemplateRepository);
export const updateAdviserCountUseCase = new UpdateAdviserCountUseCase(budgetTemplateRepository);
export const resetManualOverrideUseCase = new ResetManualOverrideUseCase(budgetTemplateRepository);

// ─── Adviser sales report use cases ──────────────────────────────────────────
export const uploadSalesReportUseCase = new UploadSalesReportUseCase(adviserSalesReportRepository);
export const getSalesReportUseCase = new GetSalesReportUseCase(adviserSalesReportRepository);
