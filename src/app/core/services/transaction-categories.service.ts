import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Params } from "@angular/router";
import { TransactionCategoryModel } from "@core/models/transaction-categories.model";
import { Pagination } from "@models/pagination.model";
import { Observable } from "rxjs";

@Injectable({providedIn: "root"})
export class TransactionCategoriesService {

  constructor(private http: HttpClient) {}

  getTransactionCategories(params?: Params): Observable<Pagination<TransactionCategoryModel>> {
    return this.http.get<Pagination<TransactionCategoryModel>>('/transaction-categories', {params})
  }
}
