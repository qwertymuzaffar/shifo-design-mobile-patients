import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { TranslocoLoader } from '@jsverse/transloco';
import { Observable, forkJoin, map } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http: HttpClient;

  constructor(private httpBackend: HttpBackend) {
    this.http = new HttpClient(httpBackend);
  }

  getTranslation(lang: string): Observable<any> {
    const modules = [
      'analytics', 'doctors', 'patients',
      'finance', 'payments', 
      'appointments', 'appointments-dialog', 
      'appointments-dialog2', 'dashboard'];

    const requests = modules.map(file =>
      this.http.get(`/assets/i18n/${lang}/${file}.json`)
    );

    return forkJoin(requests).pipe(
      map(parts => Object.assign({}, ...parts))
    );
  }
}
