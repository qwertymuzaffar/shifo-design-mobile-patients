import { Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { TokenService } from '@core/services/token.service';
import { LoginService } from '@login/services/login.service';
import { FormFieldComponent } from '@shared/controls';
import { finalize, first, switchMap } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { NgxRolesService } from 'ngx-permissions';
import { UserService } from '@core/services/user.service';
import { UserInterface } from '@core/models/user.model';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
@Component({
  selector: 'app-login',
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    FormFieldComponent,
    LucideAngularModule
],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private translocoService = inject(TranslocoService)
  private tokenService = inject(TokenService);
  private loginService = inject(LoginService);
  private userService = inject(UserService);
  readonly isLoading = signal<boolean>(false);
  private toastService = inject(ToastService);
  private ngxRoleService = inject(NgxRolesService);

  protected readonly EyeOff = EyeOff;
  protected readonly Eye = Eye;
  public show = false;
  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;

    const { username, password } = this.form.value;
    this.isLoading.set(true);
    this.loginService
      .login({
        username: username?.trim() ?? '',
        password: password?.trim() ?? '',
      })
      .pipe(
        first(),
        switchMap((res) => {
          this.tokenService.saveToken(res.access_token);

          return this.userService.getProfile()
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (res: UserInterface) => {
          this.userService.saveUserInfoToStorage(res)
          this.ngxRoleService.addRoleWithPermissions(res.role.toUpperCase(), res.permissions)
          this.router.navigate(['/']);
        },
        error: () => {
          this.toastService.openToast(
            this.translocoService.translate('app-dialog.error'),
            this.translocoService.translate('auth.invalid_credentials'),
            'error',
          );
        },
      });
  }
}
