import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentInterface } from '@core/models/payment.model';
import { Pagination } from '@models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private httpClient = inject(HttpClient);

  getPayments(): Observable<Pagination<PaymentInterface>> {
    return this.httpClient.get<Pagination<PaymentInterface>>('/payments');
  }

  getPayment(id: number): Observable<PaymentInterface> {
    return this.httpClient.get<PaymentInterface>(`/payments/${id}`);
  }

  createPayment(payment: any): Observable<PaymentInterface> {
    return this.httpClient.post<PaymentInterface>('/payments', payment);
  }

  updatePayment(id: number, payment: any): Observable<PaymentInterface> {
    return this.httpClient.put<PaymentInterface>(`/payments/${id}`, payment);
  }

  deletePayment(id: number): Observable<PaymentInterface> {
    return this.httpClient.delete<PaymentInterface>(`/payments/${id}`);
  }
}
