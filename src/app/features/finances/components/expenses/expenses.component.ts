import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { Calendar, DollarSign, Funnel, TrendingDown, LucideAngularModule, SquarePen } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { UpsertExpenseDialogComponent } from './upsertExpenseDialog/upsertExpenseDialog.component';
import { TransactionsService } from '@core/services/transactions.service';
import { TransactionsModel, TransactionType } from '@core/models/transactions.model';
import { PaginationComponent } from "@shared/components";
import { Pagination } from '@models/pagination.model';
import { CommonModule } from '@angular/common';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { WithQueryParams } from '@core/router/with-query-params';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionCategoriesService } from '@core/services/transaction-categories.service';
import { debounceTime, startWith, switchMap } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-expenses',
  imports: [PaginationComponent, CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, TranslocoPipe],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesComponent extends WithQueryParams implements  OnInit {
  TrendingDown = TrendingDown;
  Calendar = Calendar;
  DollarSign = DollarSign;
  Funnel = Funnel;
  SquarePen = SquarePen;
  
  private dialog = inject(MatDialog)
  private transactionService = inject(TransactionsService)
  private transactionCategoryService = inject(TransactionCategoriesService)
  private activatedRoute = inject(ActivatedRoute);

  form = new FormGroup({
    search: new FormControl<string>('', {nonNullable: true}),
    page: new FormControl<number>(1, {nonNullable: true}),
    limit: new FormControl<number>(10, {nonNullable: true}),
    categoryId: new FormControl<number>(0, {nonNullable: true}),
  });

  categories = rxResource({
    stream: () => this.transactionCategoryService.getTransactionCategories(),
  });

  loadingTransactions = signal(false);

  data = signal<Pagination<TransactionsModel>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  ngOnInit(): void {
    this.syncQueryParams()
    this.getTransactions()
  }

  openUpsertExpenseDialog(transaction?: TransactionsModel) {
      this.dialog.open(UpsertExpenseDialogComponent, {
        width: '700px',
        maxWidth: '90vw',
        data: {
          transaction,
          onSuccess: () => this.getTransactions()
        }
      });
  }

  pageChange(page: number): void {
    this.form.patchValue({ page });
    this.router.navigate([], {
      queryParams: {
        ...this.activatedRoute.snapshot.queryParams,
        limit: this.form.get("limit")?.value,
        page,
      },
    });
  }

  limitChange(limit: number): void {
    this.form.patchValue({ limit, page: 1 });
    this.router.navigate([], {
      queryParams: {
        ...this.activatedRoute.snapshot.queryParams,
        limit,
        page: 1,
      },
    });
  }

  getTransactions(): void {
    let prevSearchTerm = "";
    this.loadingTransactions.set(true);
    this.form.valueChanges
      .pipe(
        startWith(this.form.getRawValue()),
        debounceTime(300),
        switchMap(({ categoryId, ...rest }) => {
          this.loadingTransactions.set(true);
          const query = {...rest} as Record<string, number | string>;

          if(categoryId && +categoryId) {
            query['categoryId'] = categoryId
          }

          if(rest.search !== prevSearchTerm) {
            query['page'] = 1;
            this.form.get("page")?.patchValue(1, {emitEvent: false})
          }

          return this.transactionService.getTransactions({type: TransactionType.EXPENSE, ...query});
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.loadingTransactions.set(false);
        prevSearchTerm = this.form.get("search")?.value as string
        this.data.set(res)
      });
  }
}
