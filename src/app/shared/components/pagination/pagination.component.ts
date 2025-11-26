import {Component, computed, effect, Input, input, model, output, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ChevronLeft, ChevronRight, LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  imports: [LucideAngularModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly page = model(1);
  readonly pageChange = output<number>();
  readonly totalCount = input.required<number>();
  readonly limit = input<number | undefined | null>(10);
  readonly chevronLeft = ChevronLeft;
  readonly chevronRight = ChevronRight;
  readonly limitChange = output<number>();
  readonly limitSignal = signal(10);
  readonly pageSizeOptions = [10, 20, 30, 40, 50, 100];

  total = computed(() => {
    return Math.ceil(this.totalCount() / (this.limitSignal() || 10));
  });

  constructor() {
    effect(() => {
      this.limitSignal.set(this.limit() || 10)
    })
  }

  pages = computed(() => {
    const current = this.page();
    const total = this.total();
    const pagesToShow: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pagesToShow.push(i);
      }
      return pagesToShow;
    }

    if (current <= 3) {
      pagesToShow.push(1, 2, 3, '...', total);
    } else if (current >= total - 2) {
      pagesToShow.push(1, '...', total - 2, total - 1, total);
    } else {
      pagesToShow.push(
        1,
        '...',
        current - 1,
        current,
        current + 1,
        '...',
        total,
      );
    }

    return pagesToShow;
  });

  public goToPage(page: number | string): void {
    if (typeof page === 'number') {
      this.page.set(page);
      this.pageChange.emit(page);
    }
  }

  public prevPage(): void {
    if (this.page() > 1 && this.page() <= this.totalCount()) {
      this.page.update((p) => {
        const prevPage = p - 1;
        this.pageChange.emit(prevPage);
        return prevPage;
      });
    }
  }

  public nextPage(): void {
    if (this.page() < this.total()) {
      this.page.update((p) => {
        const nextPage = Number(p) + 1;
        this.pageChange.emit(nextPage);
        return nextPage;
      });
    }
  }

  onLimitChange(event: Event): void {
    const selectEl = event.target as HTMLSelectElement;
    const newLimit = Number(selectEl.value);
    const oldLimit = this.limitSignal();
    const currentPage = this.page();
    const offset = (currentPage - 1) * oldLimit;
    const newPage = Math.floor(offset / newLimit) + 1;
    selectEl.blur();
    this.limitSignal.set(newLimit);
    this.page.set(newPage);

    this.limitChange.emit(newLimit);
    this.pageChange.emit(newPage);
  }
}
