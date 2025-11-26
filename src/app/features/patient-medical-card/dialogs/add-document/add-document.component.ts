import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentModel } from '@core/models/document.model';
import { DocumentService } from '@core/services/document.service';
import { ToastService } from '@core/services/toast.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { FormFieldComponent } from '@shared/controls';
import { first } from 'rxjs';

@Component({
  selector: 'app-add-document',
  imports: [ReactiveFormsModule, FormFieldComponent, TranslocoPipe],
  templateUrl: './add-document.component.html',
  styleUrl: './add-document.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDocumentComponent {
  lang = ""
  constructor(private translate: TranslocoService){
    this.lang = this.translate.getActiveLang();
  }

  private matDialogRef = inject(MatDialogRef);
  private documentService = inject(DocumentService);
  private toastService = inject(ToastService);
  readonly data = inject(MAT_DIALOG_DATA);
  selectedFile = signal<File>({} as File);
  isLoading = signal(false);

  statusOptions: { [lang: string]: { name: string; status: string }[] } = {
    ru: [
      { name: 'На рассмотрении', status: 'pending' },
      { name: 'Одобрен', status: 'approved' },
    ],
    en: [
      { name: 'Pending', status: 'pending' },
      { name: 'Approved', status: 'approved' },
    ]
  };


  documentTypes = rxResource({
    stream: () => this.documentService.getDocumentTypes(),
    defaultValue: [],
  });

  documentForm = new FormGroup({
    title: new FormControl('', { validators: [Validators.required], nonNullable: true}),
    description: new FormControl('', { nonNullable: true }),
    documentTypeId: new FormControl(null),
    status: new FormControl('approved', { nonNullable: true }),
  });


  closeModal(): void {
    this.matDialogRef.close();
  }

  onDocumentTypeChange(event: Event): void {
    const selectEl = event.target as HTMLSelectElement;
    selectEl.blur();
  }

  onSubmit() {
    if (this.isLoading() || this.documentForm.invalid) return;

    const formData = new FormData();
    const patientId = this.data.patientId;

    formData.append('patientId', patientId);
    formData.append('file', this.selectedFile(), this.selectedFile().name);

    Object.entries(this.documentForm.getRawValue()).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    this.isLoading.set(true)
    this.documentService.addNewDocument(formData)
      .pipe(
        first()
      )
      .subscribe({
        next: (newDocument: DocumentModel) => {
          this.isLoading.set(false);
          if (this.lang=='ru'){
            this.toastService.openToast('', 'Документ успешно создан');
          }
          else{
             this.toastService.openToast('', 'Document created successfully');
          }
          
          const documentTypeName = this.documentTypes.value().find(({id}) => id === newDocument.documentTypeId)?.name
          this.matDialogRef.close({...newDocument, documentType: {name: documentTypeName, id: newDocument.documentTypeId}})
        }, error: (err) => {
          this.isLoading.set(false)
          if (this.lang=='ru'){
              this.toastService.openToast('Ошибка','Не удалось создан документа','error',
            );
          }
          else{
              this.toastService.openToast('Error','Failed to create document','error',
            );
          }
          
        }
      });
  }

  onFileUpload(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.length && input.files[0];

    if (file) {
      this.selectedFile.set(file);
    }
  }
}
