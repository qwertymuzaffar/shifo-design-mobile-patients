import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { PaymentMethod } from '@features/analytics/models/analytics.models';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [
    TranslocoPipe,
  ],
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.scss',
})
export class PaymentMethodsComponent {
  paymentMethods = input<PaymentMethod[]>([]);
}

