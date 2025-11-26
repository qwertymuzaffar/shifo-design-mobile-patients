import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { PaymentMethodType, PaymentType } from '@core/models/payment.model';
import { AppointmentService } from '@core/services/appointment.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormFieldComponent } from '@shared/controls';
import { finalize, first, map, of, switchMap } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { PatientService } from '@features/patients/services/patient.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-payment-dialog',
  imports: [
    TranslocoPipe,
    MatDialogClose,
    ReactiveFormsModule,
    FormFieldComponent,
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.scss',
})
export class PaymentDialogComponent implements OnInit {
  private translocoService = inject(TranslocoService);
  private appointmentService = inject(AppointmentService);
  private appointmentId: number = inject(MAT_DIALOG_DATA);
  private patientService = inject(PatientService);

  balance = toSignal(
    this.appointmentService.getAppointment(this.appointmentId).pipe(
      map((app) => app.patientId),
      switchMap((patientId) => {
        if (patientId === null) return of('0');
        return this.patientService
          .getPatientMedicalCardInfo(patientId)
          .pipe(map((medicalCard) => medicalCard.patient.balance ?? '0'));
      }),
    ),
    { initialValue: '0' },
  );

  balanceNumber = computed(() => {
    return +this.balance();
  });

  paymentKindOptions = signal([
    {
      value: PaymentMethodType.CASH,
      label: this.translocoService.translate('payment.cash'),
    },
    {
      value: PaymentMethodType.ALIF,
      label: this.translocoService.translate('payment.alif'),
    },
    {
      value: PaymentMethodType.ESKHATA,
      label: this.translocoService.translate('payment.eskhata'),
    },
    {
      value: PaymentMethodType.DC,
      label: this.translocoService.translate('payment.dc'),
    },
    {
      value: PaymentType.Debt,
      label: this.translocoService.translate('addPayment.payment_type_debt'),
    },
    {
      value: PaymentType.DebtPayment,
      label: this.translocoService.translate(
        'addPayment.payment_type_debt_payment',
      ),
    },
    {
      value: PaymentType.BalanceDeduction,
      label: this.translocoService.translate(
        'addPayment.payment_type_balance_deduction',
      ),
    },
  ]);

  paymentTypeOptions = signal([
    {
      value: PaymentMethodType.CASH,
      label: this.translocoService.translate('payment.cash'),
    },
    {
      value: PaymentMethodType.ALIF,
      label: this.translocoService.translate('payment.alif'),
    },
    {
      value: PaymentMethodType.ESKHATA,
      label: this.translocoService.translate('payment.eskhata'),
    },
    {
      value: PaymentMethodType.DC,
      label: this.translocoService.translate('payment.dc'),
    },
  ]);

  readonly form = new FormGroup({
    amount: new FormControl<number>(0, {
      validators: [Validators.required, Validators.min(0)],
    }),
    paymentKind: new FormControl<string>(PaymentMethodType.CASH, {
      validators: [Validators.required],
    }),
    paymentType: new FormControl<string>(PaymentMethodType.CASH, {
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    this.appointmentService
      .getAppointment(this.appointmentId)
      .pipe(first())
      .subscribe((appointment) => {
        this.form.patchValue({
          amount: appointment.doctor.consultationFee,
        });
      });
  }

  private matDialogRef = inject(MatDialogRef<PaymentDialogComponent>);
  private toastService = inject(ToastService);
  readonly isLoading = signal(false);

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.form.getRawValue();

    const amount = formValue.amount!;
    const selectedMethod = formValue.paymentKind!;
    const debtPaymentType = formValue.paymentType!;

    const payload: {
      amount: number;
      paymentType: string;
      paymentKind?: string;
    } = {
      amount,
      paymentType: '',
      paymentKind: '',
    };

    const simplePaymentMethods: string[] = [
      PaymentMethodType.CASH,
      PaymentMethodType.ALIF,
      PaymentMethodType.ESKHATA,
      PaymentMethodType.DC,
    ];

    if (simplePaymentMethods.includes(selectedMethod)) {
      payload.paymentKind = PaymentType.Payment;
      payload.paymentType = selectedMethod;
    } else if (selectedMethod === PaymentType.DebtPayment) {
      payload.paymentKind = PaymentType.DebtPayment;
      payload.paymentType = debtPaymentType;
    } else {
      payload.paymentKind = selectedMethod;
      payload.paymentType = PaymentMethodType.CASH;
    }

    this.appointmentService
      .completeAppointment(this.appointmentId, payload)
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.matDialogRef.close(true);
        },
        error: () => {
          this.toastService.openToast(
            this.translocoService.translate('app-dialog.complete_error'),
            this.translocoService.translate('app-dialog.error'),
            'error',
          );
        },
      });
  }
}
