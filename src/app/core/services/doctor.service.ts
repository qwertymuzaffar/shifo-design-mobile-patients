import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Doctor, DoctorCreate, DoctorListResponse} from "@features/doctor/models/doctor";
import {Params} from "@angular/router";
import {Observable} from "rxjs";
import {Pagination} from "@models/pagination.model";

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private httpClient = inject(HttpClient);


  getDoctors(params?: Params): Observable<Pagination<Doctor>> {
    return this.httpClient.get<Pagination<Doctor>>('/doctors', { params });
  }

  getDoctor():Observable<DoctorListResponse> {
    return this.httpClient.get<DoctorListResponse>('/doctors' );
  }

  getDoctorById(id:number):Observable<Doctor> {
    return this.httpClient.get<Doctor>(`/doctors/${id}` );
  }

  createDoctor(doctor: DoctorCreate) {
    return this.httpClient.post<Doctor>('/doctors', doctor);
  }

  updateDoctor(id: number, doctor: DoctorCreate) {
    return this.httpClient.patch<Doctor>(`/doctors/${id}`, doctor);
  }

  deleteDoctor(id: number) {
    return this.httpClient.delete(`/doctors/${id}`);
  }
}
