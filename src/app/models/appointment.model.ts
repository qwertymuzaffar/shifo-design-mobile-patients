import { AppointmentStatus } from '@features/appointments/models/appointment.model';
import { Doctor } from '@features/doctor/models/doctor';
import { PatientModel } from '@features/patients/models/patient.model';

export enum AppointmentType {
  CONSULTATION = "consultation",
  FOLLOW_UP = "followup",
  PROCEDURE = "procedure",
  EMERGENCY = "emergency"
}

export interface AppointmentModel {
  id: number;
  time: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  patientId: number | null;
  duration: number;
  notes: string;
  symptoms: string;
  status: AppointmentStatus;
  type: AppointmentType;
  doctor: Doctor;
  patient: PatientModel;
}

export type AppointmentUpsertModel = Partial<AppointmentModel> & {
  datetimes?: { date: string; time: string }[];
};
