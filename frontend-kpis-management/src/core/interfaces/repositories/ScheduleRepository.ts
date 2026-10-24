import {
  WeeklySchedule,
  WeeklyScheduleSummary,
  ScheduleSlotUpdateRequest,
  ScheduleConfig,
} from '../../domain/Schedule/Schedule';

export interface ScheduleRepository {
  getAll(): Promise<WeeklyScheduleSummary[]>;
  getById(id: number): Promise<WeeklySchedule>;
  create(weekStart: string): Promise<WeeklySchedule>;
  generate(id: number): Promise<WeeklySchedule>;
  updateSlot(slotId: number, req: ScheduleSlotUpdateRequest): Promise<WeeklySchedule>;
  publish(id: number): Promise<WeeklySchedule>;
  unpublish(id: number): Promise<WeeklySchedule>;
  getConfig(): Promise<ScheduleConfig>;
  saveConfig(cfg: Partial<ScheduleConfig>): Promise<ScheduleConfig>;
  clearSlots(id: number): Promise<WeeklySchedule>;
  exportExcel(id: number): Promise<Blob>;
}
