import {Directive, Input, Output, EventEmitter, NgZone, inject, DestroyRef, OnDestroy} from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { tap } from 'rxjs/operators';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Directive({
  selector: 'mat-autocomplete[optionsScroll]',
  standalone: true
})

export class OptionsScrollDirective implements OnDestroy {

  @Input() thresholdPercent = 0.8;
  @Output('optionsScroll') scroll = new EventEmitter<void>();
  private _scrollHandler = this.onScroll.bind(this);
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  constructor(private autocomplete: MatAutocomplete) {
    this.autocomplete.opened
      .pipe(
        tap(() => {
          this.zone.onStable
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              setTimeout(() => {
                const panel = this.autocomplete.panel?.nativeElement;
                if (panel) {
                  panel.addEventListener('scroll', this._scrollHandler);
                }
              });
            });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.autocomplete.closed
      .pipe(
        tap(() => this.removeScrollListener()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  private onScroll(event: Event) {
    const el = event.target as HTMLElement;
    const atBottom = (el.scrollTop + el.clientHeight) >= (el.scrollHeight * this.thresholdPercent);
    if (atBottom) {
      this.scroll.emit();
    }
  }

  private removeScrollListener() {
    const panel = this.autocomplete.panel?.nativeElement;
    if (panel) {
      panel.removeEventListener('scroll', this._scrollHandler);
    }
  }

  ngOnDestroy() {
    this.removeScrollListener();
  }
}
