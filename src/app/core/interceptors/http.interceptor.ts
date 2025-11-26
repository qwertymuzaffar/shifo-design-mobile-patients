import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { TokenService } from '@core/services/token.service';
import { NgxRolesService } from 'ngx-permissions';
import { UserService } from '@core/services/user.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const token = tokenService.getToken();

  req = req.clone({
    url: environment.apiUrl + req.url,
  });

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        tokenService.clearUserCredential();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
