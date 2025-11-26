import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Params } from '@angular/router';
import { PatientModel } from '@features/patients/models/patient.model';
import { Pagination } from '@models/pagination.model';
import { PatientMedicalCardModel } from '@features/patient-medical-card/models/patient-medical-card.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  patientMedicalCardInfo$ = new BehaviorSubject<{loading: boolean, data: PatientMedicalCardModel}>({loading: false, data: {} as PatientMedicalCardModel});
  private http = inject(HttpClient);

  getPatients(params?: Params): Observable<Pagination<PatientModel>> {
    return this.http.get<Pagination<PatientModel>>('/patients', { params });
  }

  getPatientsById(id: number): Observable<PatientModel> {
    return this.http.get<PatientModel>(`/patients/${id}`);
  }

  deletePatients(id: number): Observable<PatientModel> {
    return this.http.delete<PatientModel>(`/patients/${id}`);
  }

  createPatient(patient: PatientModel): Observable<PatientModel> {
    return this.http.post<PatientModel>('/patients', patient);
  }

  updatePatient(id: number, patient: PatientModel): Observable<PatientModel> {
    return this.http.patch<PatientModel>(`/patients/${id}`, patient);
  }

  getPatientMedicalCardInfo(id: number): Observable<PatientMedicalCardModel> {
   return this.http.get<PatientMedicalCardModel>(`/patients/${id}/show`)
  }
}
