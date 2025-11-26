import {
  APP_INITIALIZER,
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideAppInitializer,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  Router,
  withPreloading,
} from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { httpInterceptor } from '@core/interceptors/http.interceptor';
import { NgxPermissionsModule, NgxRolesService } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';
import { catchError, of, tap } from 'rxjs';
import { TokenService } from '@core/services/token.service';
import { UserService } from '@core/services/user.service';
import { ToastService } from '@core/services/toast.service';
import { provideTranslocoConfig } from './transloco.config';

import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: 'https://ab78452fd7418d51f86c3f140dc9d70a@o4510393037160448.ingest.de.sentry.io/4510393044697168',
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([httpInterceptor])),
    provideEnvironmentNgxMask(),
    importProvidersFrom(NgxPermissionsModule.forRoot()),
    provideTranslocoConfig(),
    provideAppInitializer(permissionConfig),
    provideHttpClient(),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
};

function permissionConfig() {
  const tokenService = inject(TokenService);
  if (!tokenService.getToken()) return;

  const toastService = inject(ToastService);
  const userService = inject(UserService);
  const ngxRoleService = inject(NgxRolesService);

  return userService.getProfile().pipe(
    tap((res) => {
      userService.saveUserInfoToStorage(res);
      ngxRoleService.flushRoles();
      ngxRoleService.flushRolesAndPermissions();
      ngxRoleService.addRoleWithPermissions(
        res.role.toUpperCase(),
        res.permissions,
      );
    }),
    catchError((err) => {
      console.warn('Ошибка загрузки данных пользователя:', err);
      userService.saveUserInfoToStorage({ role: UserRole.DOCTOR, id: 0 });
      toastService.openToast(
        '',
        'Ошибка загрузки данных пользователя',
        'error',
      );
      ngxRoleService.addRoleWithPermissions(UserRole.DOCTOR, []);
      return of(null);
    }),
  );
}
