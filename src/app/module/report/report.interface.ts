import { CreateDailyWorkReportInput } from "./report.validation";

export type CreateReportPayload = CreateDailyWorkReportInput;

export interface ReportWorkerInput {
  name: string;
  role?: string | undefined;
  hoursWorked?: number | undefined;
}

export interface CreateReportData {
  projectId: string;
  submittedById: string;
  reportDate: Date;
  workCompleted: string;
  hoursWorked: number;
  materialsUsed?: string | undefined;
  progressPct: number;
  problemsEncountered?: string | undefined;
  notes?: string | undefined;
  workers: ReportWorkerInput[];
}