import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { StatCardComponent } from '@components/stat-card/stat-card.component';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-angular';
import { PaymentComponent } from './components/payment/payment.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { AddPaymentDialogComponent } from './components/payment/dialogs/add-payment-dialog/add-payment-dialog.component';
import { UpsertExpenseDialogComponent } from './components/expenses/upsertExpenseDialog/upsertExpenseDialog.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { BalancesService } from '@core/services/balances.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';

enum TabType {
  Payments = 'payments',
  Expenses = 'expenses',
}

@Component({
  selector: 'app-finances',
  imports: [
    CommonModule,
    PaymentComponent,
    ExpensesComponent,
    StatCardComponent,
    TranslocoPipe,
    NgxPermissionsModule,
  ],
  templateUrl: './finances.component.html',
  styleUrl: './finances.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class FinancesComponent {
  @ViewChild(PaymentComponent) paymentComponent!: PaymentComponent;
  @ViewChild(ExpensesComponent) expensesComponent!: ExpensesComponent;
  private dialog = inject(MatDialog);
  private balancesService = inject(BalancesService);
  private datePipe = inject(DatePipe);

  TrendingDown = TrendingDown;
  TrendingUp = TrendingUp;
  DollarSign = DollarSign;
  activeTab = signal(TabType.Payments);
  tabType = TabType;
  filterData = signal<{ from: Date | null; to: Date | null, filterByAppointmentDate: boolean }>({
    from: null,
    to: null,
    filterByAppointmentDate: true,
  });

  balancesSummary = rxResource({
    params: () => this.filterData(),
    stream: ({ params }) => {
      return this.balancesService.getBalanceSummary({
        ...(params.from && {
          dateFrom: this.datePipe.transform(params.from, 'yyyy-MM-dd'),
        }),
        ...(params.to && {
          dateTo: this.datePipe.transform(params.to, 'yyyy-MM-dd'),
        }),
        filterByAppointmentDate: params.filterByAppointmentDate,
      });
    },
  });

  handleAddPayment() {
    this.dialog.open(AddPaymentDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: {
        onSuccess: () => {
          if(this.activeTab() === TabType.Payments) {
            this.paymentComponent.loadPayments()
          }
          this.balancesSummary.reload()
        }
      },
    });
  }

  handleAddExpense() {
    this.dialog.open(UpsertExpenseDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: {
        onSuccess: () => {
          if(this.activeTab() === TabType.Expenses) {
            this.expensesComponent.getTransactions()
          }
          this.balancesSummary.reload()
        }
      },
    });
  }

  protected readonly userRole = UserRole;
}
