import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SpecializationModel } from '@core/models/specialization.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpecializationService {
  private httpClient = inject(HttpClient);

  getSpecializations() {
    return this.httpClient.get<SpecializationModel[]>('/specializations');
  }

  createSpecialization(name: string): Observable<SpecializationModel> {
    return this.httpClient.post<SpecializationModel>('/specializations', {
      name,
    });
  }

  updateSpecialization(id: number, specialization: SpecializationModel) {
    return this.httpClient.put(`/specializations/${id}`, specialization);
  }

  deleteSpecialization(id: number) {
    return this.httpClient.delete(`/specializations/${id}`);
  }
}
