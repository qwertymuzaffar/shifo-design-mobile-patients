import {
  Component,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TokenService } from '@core/services/token.service';
import { UserService } from '@core/services/user.service';
import { SidebarItemComponent } from '@layout/sidebar/sidebar-item.component';
import { SidebarUserComponent } from '@layout/sidebar/sidebar-user.component';
import {
  House,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  Activity,
  LogOut,
  LucideAngularModule,
} from 'lucide-angular';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navigation-menu',
  imports: [
    TranslocoPipe,
    RouterLink,
    SidebarItemComponent,
    SidebarUserComponent,
    LucideAngularModule,
    NgxPermissionsModule,
    NgClass,
  ],
  templateUrl: './navigation-menu.component.html',
  styleUrl: './navigation-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationMenuComponent {
  private readonly translocoService = inject(TranslocoService);
  private readonly router = inject(Router);
  readonly tokenService = inject(TokenService);
  private readonly userService = inject(UserService);

  isMobile = input<boolean>(false);
  collapsed = input<boolean>(false);
  itemClick = output<void>();

  readonly userRole = UserRole;
  readonly currentLang = signal<string>(this.translocoService.getActiveLang());

  readonly profile = rxResource({
    stream: () => this.userService.getProfile(),
  });

  protected readonly House = House;
  protected readonly Users = Users;
  protected readonly UserCheck = UserCheck;
  protected readonly Calendar = Calendar;
  protected readonly CreditCard = CreditCard;
  protected readonly Activity = Activity;
  protected readonly LogOut = LogOut;

  setLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang.set(lang);
    this.router.navigate([], {
      queryParams: { lang },
      queryParamsHandling: 'merge',
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  logOut(): void {
    this.tokenService.clearUserCredential();
    this.router.navigate(['/login']);
  }

  onItemClick(): void {
    this.itemClick.emit();
  }
}
