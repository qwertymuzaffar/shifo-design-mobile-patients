import { PaymentMethodType } from './payment.model';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export type TransactionsModel = Omit<CreateTransactionModel, 'categoryId'> & {
  id: number;
  category: string;
  categoryEntity: {
    createdAt: string;
    deletedAt: null;
    description: string;
    id: number;
    isActive: boolean;
    name: string;
    sortOrder: number;
    updatedAt: string;
  };
  userId: 1;
  user: {
    id: 1;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
};

export interface CreateTransactionModel {
  type: TransactionType;
  paymentMethod: PaymentMethodType;
  amount: number;
  categoryId: number;
  date: string;
  comment: string;
  description: string;
  recipient: string;
  notes: string;
}

export interface CreateTransactionResponseModel extends CreateTransactionModel {
  id: number;
  category: {
    id: number;
    name: string;
    nameRu: string;
    color: string;
    icon: string;
  };
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsSummaryModel {
  averageAmount: number,
  categoriesCount: number,
  totalSpending: number,
  transactionCount: number
}
