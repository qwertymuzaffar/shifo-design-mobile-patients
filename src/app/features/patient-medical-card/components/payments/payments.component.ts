import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { PaymentService } from '@core/services/payment.service';
import { PaymentInterface, PaymentStatusEnum, PaymentMethodType } from '@core/models/payment.model';
import { PatientService } from '@features/patients/services/patient.service';
import { LucideDollarSign, LucideCreditCard, LucideAngularModule, LucideCheckCircle, LucideXCircle, LucideClock } from 'lucide-angular';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, LucideAngularModule, TranslocoPipe, DatePipe],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent {
  private paymentService = inject(PaymentService);
  private patientService = inject(PatientService);

  protected readonly DollarSign = LucideDollarSign;
  protected readonly CreditCard = LucideCreditCard;
  protected readonly CheckCircle = LucideCheckCircle;
  protected readonly XCircle = LucideXCircle;
  protected readonly Clock = LucideClock;

  protected readonly PaymentStatus = PaymentStatusEnum;
  protected readonly PaymentMethod = PaymentMethodType;

  private refreshTrigger = signal(0);
  private patientInfo$ = toObservable(this.refreshTrigger).pipe(
    switchMap(() => this.patientService.patientMedicalCardInfo$)
  );

  payments = rxResource({
    stream: () => this.patientInfo$.pipe(
      switchMap((info) => {
        if (info.data?.patient?.id) {
          return this.paymentService.getPaymentsByPatient(info.data.patient.id);
        }
        return [];
      })
    ),
    defaultValue: [],
  });

  getPaymentMethodLabel(method: PaymentMethodType): string {
    const labels = {
      [PaymentMethodType.CASH]: 'Наличные',
      [PaymentMethodType.DC]: 'Карта',
      [PaymentMethodType.ESKHATA]: 'Эсхата',
      [PaymentMethodType.ALIF]: 'Алиф'
    };
    return labels[method] || method;
  }

  getPaymentStatusLabel(status: PaymentStatusEnum): string {
    const labels = {
      [PaymentStatusEnum.PAID]: 'Оплачен',
      [PaymentStatusEnum.PENDING]: 'Ожидает',
      [PaymentStatusEnum.FAILED]: 'Ошибка'
    };
    return labels[status] || status;
  }

  getPaymentStatusColor(status: PaymentStatusEnum): string {
    const colors = {
      [PaymentStatusEnum.PAID]: 'bg-green-100 text-green-800',
      [PaymentStatusEnum.PENDING]: 'bg-yellow-100 text-yellow-800',
      [PaymentStatusEnum.FAILED]: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
