import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {ProcedureRes} from "@core/models/procedure.models";

@Injectable({
  providedIn: 'root',
})
export class ProcedureService {

  private httpClient = inject(HttpClient);


  getProcedure(): Observable<ProcedureRes[]> {
    return this.httpClient.get<ProcedureRes[]>('/procedures');
  }

  getProcedureId(id: number): Observable<ProcedureRes> {
    return this.httpClient.get<ProcedureRes>(`/procedures/${id}`);
  }

  createProcedure(procedure: any): Observable<ProcedureRes> {
    return this.httpClient.post<ProcedureRes>('/procedures', procedure);
  }

  updateProcedure(id: number, procedure: any): Observable<ProcedureRes> {
    return this.httpClient.put<ProcedureRes>(`/procedures/${id}`, procedure);
  }

  deleteProcedure(id: number): Observable<ProcedureRes> {
    return this.httpClient.delete<ProcedureRes>(`/procedures/${id}`);
  }
}
