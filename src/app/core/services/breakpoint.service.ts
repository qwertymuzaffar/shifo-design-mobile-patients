import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  private breakpointObserver = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);

  readonly isMobile = signal(false);
  readonly isTablet = signal(false);

  constructor() {
    this.breakpointObserver
      .observe('(max-width: 768px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.isMobile.set(result.matches);
      });

    this.breakpointObserver
      .observe('(min-width: 769px) and (max-width: 1024px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.isTablet.set(result.matches);
      });
  }
}

