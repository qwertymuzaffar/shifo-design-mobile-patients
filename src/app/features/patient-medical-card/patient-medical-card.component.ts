import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { PatientService } from '@features/patients/services/patient.service';
import { PatientMedicalCardModel } from './models/patient-medical-card.model';
import { CommonModule } from '@angular/common';
import { ToastService } from '@core/services/toast.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-patient-medical-card',
  imports: [
    TranslocoPipe,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    RouterLink
],
  templateUrl: './patient-medical-card.component.html',
  styleUrl: './patient-medical-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientMedicalCardComponent implements OnInit {
  patientService = inject(PatientService)
  activeRoute = inject(ActivatedRoute)
  toastService = inject(ToastService)
  loading = signal(false)
  translocoService = inject(TranslocoService)

  ngOnInit(): void {
    const patientId = this.activeRoute.snapshot.paramMap.get("patient_id");
    if(patientId) {
      this.loading.set(true)
      this.patientService.patientMedicalCardInfo$.next({loading: true, data: {} as PatientMedicalCardModel})
      this.patientService.getPatientMedicalCardInfo(+patientId)
       .subscribe({
        next: (res: PatientMedicalCardModel) => {
            this.loading.set(false);
            this.patientService.patientMedicalCardInfo$.next({loading: false, data: res})
        }, error: (err) => {
            this.loading.set(false)
            this.patientService.patientMedicalCardInfo$.next({loading: false, data: {} as PatientMedicalCardModel})
            this.toastService.openToast(err.message, this.translocoService.translate('app-dialog.error'), 'error',
          );
        },
       })
    }
  }
}
