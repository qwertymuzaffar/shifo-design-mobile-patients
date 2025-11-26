import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PaymentMethodType,
  PaymentStatusEnum,
  PaymentType,
} from '@core/models/payment.model';
import { FormFieldComponent } from '@shared/controls';
import {
  MatAutocomplete,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { Pagination } from '@models/pagination.model';
import { TransactionCategoryModel } from '@core/models/transaction-categories.model';
import { TransactionCategoriesService } from '@core/services/transaction-categories.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OptionsScrollDirective } from '@shared/directives/option-scroll/options-scroll.directive';
import { TransactionsService } from '@core/services/transactions.service';
import { ToastService } from '@core/services/toast.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TransactionType } from '@core/models/transactions.model';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-upsert-expense-dialog',
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    CommonModule,
    MatAutocompleteModule,
    OptionsScrollDirective,
    MatAutocomplete,
    TranslocoPipe
  ],
  templateUrl: './upsertExpenseDialog.component.html',
  styleUrl: './upsertExpenseDialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpsertExpenseDialogComponent implements OnInit {
  private transactionCategoryService = inject(TransactionCategoriesService);
  private transactionService = inject(TransactionsService);
  private translocoService = inject(TranslocoService)
  private destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService);
  private data = inject(MAT_DIALOG_DATA);
  private matDialogRef = inject(MatDialogRef<UpsertExpenseDialogComponent>);

  isLoading = signal(false);
  isEditing = this.data.transaction;

  form = new FormGroup({
    date: new FormControl(new Date().toISOString().split('T')[0], {nonNullable: true, validators: [Validators.required]}),
    amount: new FormControl(0, {nonNullable: true, validators: [Validators.required]}),
    categoryId: new FormControl("", {nonNullable: true, validators: [Validators.required]}),
    comment: new FormControl('', {nonNullable: true}),
    recipient: new FormControl('', {nonNullable: true}),
    description: new FormControl('', {nonNullable: true}),
    notes: new FormControl("", {nonNullable: true}),
  });

  categoryControl = new FormControl("", Validators.required);
  loadingCategories = signal(false);
  currentPage = 1;
  searchText = '';

  categoryPagination = signal<Pagination<TransactionCategoryModel>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  paymentMethod = PaymentMethodType;
  paymentMethodSelected = signal(PaymentMethodType.CASH);
  loadingReceivers = signal(false);

  ngOnInit(): void {
    this.loadTransactionCategory();
    if(this.data.transaction) {
      const {date, amount, description, comment, notes, paymentMethod, categoryId, categoryEntity, recipient} = this.data.transaction;

      this.categoryControl.patchValue(categoryEntity.name, {emitEvent: false})
      this.paymentMethodSelected.set(paymentMethod)
      this.form.patchValue({date, amount: +amount,description,comment,notes,recipient,categoryId})
    }
    this.categoryControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.searchText = value || '';
        if(!value) {
          this.form.get("categoryId")?.setValue("")
        }
        this.loadTransactionCategory(true);
      });
  }

  loadTransactionCategory(reset = false) {
    if (this.loadingCategories()) return;

    if (reset) {
      this.currentPage = 1;
      this.categoryPagination.set({
        items: [],
        total: 0,
        page: 1,
        limit: this.categoryPagination().limit,
        totalPages: 0,
      });
    }

    const limit = this.categoryPagination().limit;
    const pagination = this.categoryPagination();

    if (pagination.total > 0 && pagination.items.length >= pagination.total) {
      return;
    }

    this.loadingCategories.set(true);
    this.transactionCategoryService
      .getTransactionCategories({
        search: this.searchText,
        page: this.currentPage,
        limit,
      })
      .pipe(
        finalize(() => this.loadingCategories.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: any) => {
        this.categoryPagination.update((curr) => ({
          ...curr,
          items: [...curr.items, ...res.items],
          total: res.total,
          totalPages: res.totalPages,
          page: this.currentPage,
        }));
        this.currentPage++;
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true)
    const {categoryId, ...values} = this.form.getRawValue();

    const payload = {
      type: TransactionType.EXPENSE,
      paymentMethod: this.paymentMethodSelected(),
      ...values,
      categoryId: Number(categoryId)
    }

    const action$ = this.isEditing ? this.transactionService.updateTransaction(this.data.transaction.id, payload) : this.transactionService.createTransaction(payload)
     action$.pipe(
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef),
     ).subscribe({
      next: () => {
        this.toastService.openToast('', `${this.isEditing ? this.translocoService.translate('expense.update_success') : this.translocoService.translate('expense.create_success')}`);
        this.data.onSuccess();
        this.onClose();
      }, error: () => {
        this.toastService.openToast(this.translocoService.translate('expense.error'), `${this.isEditing ? this.translocoService.translate('expense.update_error') : this.translocoService.translate('expense.create_error')}`, "error");
      }
     })
  }

  onClose() {
    this.matDialogRef.close()
  }
}
