import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';
import {
  AppointmentUpsertModel,
  AppointmentModel,
} from '@models/appointment.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private httpClient = inject(HttpClient);

  getAppointments(query: Params) {
    const params = new HttpParams({
      fromObject: {
        ...(query['doctorIds'] && {
          doctorIds: String(query['doctorIds']).split(','),
        }),
        ...(query['status'] && { status: query['status'] }),
        ...(query['patientId'] && { patientId: query['patientId'] }),
        ...(query['dateFrom'] && { dateFrom: query['dateFrom'] }),
        ...(query['dateTo'] && { dateTo: query['dateTo'] }),
      },
    });

    return this.httpClient.get<AppointmentModel[]>('/appointments', { params });
  }

  getAppointment(id: number) {
    return this.httpClient.get<AppointmentModel>(`/appointments/${id}`);
  }

  createAppointment(appointment: AppointmentUpsertModel) {
    return this.httpClient.post('/appointments', appointment);
  }

  updateAppointment(id: number, appointment: Partial<AppointmentModel>) {
    return this.httpClient.patch(`/appointments/${id}`, appointment);
  }

  cancelAppointment(id: number, reason: string) {
    return this.httpClient.patch<void>(`/appointments/cancel/${id}`, {reason});
  }

  completeAppointment(
    id: number,
    paymentData: { amount: number; paymentType: string },
  ) {
    return this.httpClient.post<AppointmentModel>(
      `/appointments/complete/${id}`,
      paymentData,
    );
  }

  hasAppointmentsByDoctorId(doctorId: number): Observable<boolean> {
    return this.getAppointments({ doctorId }).pipe(
      map((appointments) => appointments.length > 0),
    );
  }

  duplicateAppointment(
    id: number,
    appointment: Pick<AppointmentModel, 'date' | 'time'>,
  ) {
    return this.httpClient.post(`/appointments/duplicate/${id}`, appointment);
  }

  cloneAppointment(copyDate: string, dateTo: string) {
    return this.httpClient.post(`/appointments/duplicate-range`, {
      copyDate,
      dateTo,
    });
  }
}
