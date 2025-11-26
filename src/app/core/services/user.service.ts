import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserInterface } from '@core/models/user.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user = signal<UserInterface | null>(null);
  private httpClient = inject(HttpClient);

  getProfile(): Observable<UserInterface> {
    if (this.user()) {
      return of(this.user() as UserInterface)
    }
    return this.httpClient.get<UserInterface>('/auth/profile');
  }

  saveUserInfoToStorage(user: Partial<UserInterface>) {
    localStorage.setItem("user", JSON.stringify(user))
  }

  getUserInfoFromStorage(): UserInterface {
    const userStr = localStorage.getItem("user") || '{}'
    return JSON.parse(userStr)
  }

  removeUserInfoFromStorage() {
    localStorage.removeItem("user")
  }
}
