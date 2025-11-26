import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { Payments, PaymentSummary, Daum } from '../models/payment.models';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http = inject(HttpClient);

  getPayments(params?: Params): Observable<Payments> {
    return this.http.get<Payments>('/payments', { params });
  }

  getPaymentsSummary(params?: Params): Observable<PaymentSummary> {
    return this.http.get<PaymentSummary>('/payments/summary', { params });
  }

  getPayment(id: number): Observable<Daum> {
    return this.http.get<Daum>(`/payments/${id}`);
  }

  createPayment(payment: Partial<Payments>): Observable<Payments> {
    return this.http.post<Payments>('/payments', payment);
  }

  updatePayment(id: number, payment: Partial<Payments>): Observable<Payments> {
    return this.http.put<Payments>(`/payments/${id}`, payment);
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`/payments/${id}`);
  }

  updatePaymentStatus(id: number, status: string): Observable<Payments> {
    return this.http.patch<Payments>(`/payments/${id}/status/${status}`, {});
  }

}
