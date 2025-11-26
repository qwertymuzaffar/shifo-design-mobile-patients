import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationMenuComponent } from '@shared/components/navigation-menu/navigation-menu.component';
import {
  Calendar,
  Menu,
  LucideAngularModule,
} from 'lucide-angular';
import { NgxPermissionsModule } from 'ngx-permissions';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgClass } from '@angular/common';

const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed';
const LANG_KEY = 'userLang';

@Component({
  selector: 'app-sidebar',
  imports: [
    TranslocoPipe,
    NavigationMenuComponent,
    LucideAngularModule,
    NgxPermissionsModule,
    NgClass,
  ],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly translocoService = inject(TranslocoService);
  private readonly router = inject(Router);

  readonly currentLang = signal<string>(this.translocoService.getActiveLang());
  readonly collapsed = signal<boolean>(
    localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true',
  );

  protected readonly Calendar = Calendar;
  protected readonly Menu = Menu;

  constructor() {
    const savedLang = localStorage.getItem(LANG_KEY);
    if (savedLang) {
      this.setLang(savedLang);
    }
  }

  setLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang.set(lang);
    localStorage.setItem(LANG_KEY, lang);
    this.router.navigate([], {
      queryParams: { lang },
      queryParamsHandling: 'merge',
    });
  }

  toggleSidebar(): void {
    this.collapsed.update((value) => {
      const newValue = !value;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
      return newValue;
    });
  }
}
