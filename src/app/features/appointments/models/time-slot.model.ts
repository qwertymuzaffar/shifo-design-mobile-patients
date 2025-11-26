import { AppointmentModel } from '@models/appointment.model';
import { Doctor } from '@features/doctor/models/doctor';

export interface TimeSlotClickPayload {
  date: string;
  time: string;
  doctor?: Doctor;
  appointmentList: AppointmentModel[];
}
