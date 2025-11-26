import { DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export abstract class WithQueryParams {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected abstract readonly form: FormGroup;
  readonly destroyRef = inject(DestroyRef);

  protected syncQueryParams() {
    const initial = { ...this.form.value };
    for (const key in this.route.snapshot.queryParams) {
      if (this.form.contains(key)) {
        initial[key] = this.route.snapshot.queryParams[key];
      }
    }

    this.form.patchValue(initial, { emitEvent: false });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.router.navigate([], {
          queryParams: value,
          queryParamsHandling: 'merge',
        });
      });
  }
}
