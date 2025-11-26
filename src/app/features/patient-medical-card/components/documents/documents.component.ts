import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { DocumentService } from '@core/services/document.service';
import { ToastService } from '@core/services/toast.service';
import { AddDocumentComponent } from '@features/patient-medical-card/dialogs/add-document/add-document.component';
import { PatientDocumentModel, PatientMedicalCardModel } from '@features/patient-medical-card/models/patient-medical-card.model';
import { PatientService } from '@features/patients/services/patient.service';
import { ConfirmDialogComponent } from '@shared/confirm-dialog/confirm-dialog.component';
import { first } from 'rxjs';
import { LucideAngularModule, Trash2 } from "lucide-angular";
import { saveAs } from 'file-saver';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-documents',
  imports: [DatePipe, LucideAngularModule, TranslocoPipe],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent {
  translocoService = inject(TranslocoService)
  patientService = inject(PatientService);
  documentService = inject(DocumentService);
  toastService = inject(ToastService);
  dialog = inject(MatDialog);
  protected readonly Trash2 = Trash2;

  documents = rxResource({
    stream: () => this.patientService.patientMedicalCardInfo$,
    defaultValue: {loading: false, data: {} as PatientMedicalCardModel}
  })

  downloadFile(fileUrl: string, title: string) {
    saveAs(fileUrl, title)
  }

  viewDocumentFile(fileUrl: string) {
    window.open(fileUrl, "_blank")
  }

  addNewDocument(): void {
       const dialogRef = this.dialog.open(AddDocumentComponent, {
            width: '600px',
            data: {patientId: this.documents.value().data.patient.id},
          });

          dialogRef
            .afterClosed()
            .pipe(first())
            .subscribe((newDocument: PatientDocumentModel) => {
               if(newDocument) {
                 const currentData = this.patientService.patientMedicalCardInfo$.getValue().data;
                 currentData.recentDocuments.unshift(newDocument)
                 this.patientService.patientMedicalCardInfo$.next({loading: false, data: currentData})
               }
            });
    }

  deleteDocument(docId: number): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          message: this.translocoService.translate('d.confirm_delete'),
          action: () => this.documentService.deleteDocument(docId),
        },
      });

      dialogRef
        .afterClosed()
        .pipe(first())
        .subscribe({
          next: (result) => {
            if (result) {
              const data = this.documents.value().data;
              data.recentDocuments = data.recentDocuments.filter(({id}) => id !== docId);
              this.patientService.patientMedicalCardInfo$.next({loading: false, data});

              this.toastService.openToast(this.translocoService.translate('d.deleted'), this.translocoService.translate('d.delete_success'));
            }
          },
          error: (error) => {
            this.toastService.openToast(
              this.translocoService.translate('d.delete_error'),
              this.translocoService.translate('app-dialog.error'),
              'error',
            );
            console.error('Ошибка при удалении документа:', error);
          },
        });
    }
}
