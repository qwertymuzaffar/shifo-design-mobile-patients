import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Login } from '@login/models/login.model';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class LoginService {

  constructor(private http: HttpClient) {
  }

  login(data: { username: string; password: string }): Observable<Login> {
    return this.http.post<Login>('/auth/login', data);
  }
}
