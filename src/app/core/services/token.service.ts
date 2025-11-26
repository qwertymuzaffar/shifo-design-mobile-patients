import { inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { NgxRolesService } from 'ngx-permissions';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private userService = inject(UserService)
  private ngxRoleService = inject(NgxRolesService)
  private readonly TOKEN_KEY = 'access_token';

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearUserCredential(): void {
    this.userService.removeUserInfoFromStorage();
    this.ngxRoleService.flushRolesAndPermissions();
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
