import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DocumentModel, DocumentTypeModel } from '@core/models/document.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private httpClient = inject(HttpClient);

  getDocumentTypes(): Observable<DocumentTypeModel[]> {
    return this.httpClient.get<DocumentTypeModel[]>(`/documents/types`)
  }

  addNewDocument(payload: FormData): Observable<DocumentModel> {
    return this.httpClient.post<DocumentModel>("/documents", payload)
  }

  deleteDocument(id: number) {
    return this.httpClient.delete(`/documents/${id}`)
  }
}
