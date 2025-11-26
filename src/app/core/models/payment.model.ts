import { AppointmentModel } from '@models/appointment.model';

export interface PaymentInterface {
  id: number;
  appointmentId: number;
  amount: string;
  paymentType: PaymentMethodType;
  status: PaymentStatusEnum;
  createdAt: string;
  paidAt?: string;
  updatedAt: string;
  appointment: AppointmentModel;
}

export enum PaymentStatusEnum {
  PAID = 'paid',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum PaymentMethodType {
  CASH = 'cash',
  DC = 'dc',
  ESKHATA = 'eskhata',
  ALIF = 'alif',
}
// [ payment, debt, prepayment, debt_payment, balance_deduction ]
export enum PaymentType {
  Payment = 'payment',
  Debt = 'debt',
  Prepayment = 'prepayment',
  DebtPayment = 'debt_payment',
  BalanceDeduction = 'balance_deduction'
}
