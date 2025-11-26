import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Params } from "@angular/router";
import { CreateTransactionModel, CreateTransactionResponseModel, TransactionsModel, TransactionsSummaryModel, TransactionType } from "@core/models/transactions.model";
import { Pagination } from "@models/pagination.model";
import { Observable } from "rxjs";


@Injectable({providedIn: "root"})
export class TransactionsService {

  constructor(private http: HttpClient) {

  }

  getTransactions(params: Params): Observable<Pagination<TransactionsModel>> {
    return this.http.get<Pagination<TransactionsModel>>('/transactions', {params})
  }

  createTransaction(payload: CreateTransactionModel): Observable<CreateTransactionResponseModel>{
    return this.http.post<CreateTransactionResponseModel>('/transactions', payload)
  }

  getTransactionSummary(params?: Params): Observable<TransactionsSummaryModel> {
    return this.http.get<TransactionsSummaryModel>("/transactions/summary", {params})
  }

  updateTransaction(id: number, payload: CreateTransactionModel): Observable<any> {
    return this.http.patch(`/transactions/${id}`, payload)
  }
}
