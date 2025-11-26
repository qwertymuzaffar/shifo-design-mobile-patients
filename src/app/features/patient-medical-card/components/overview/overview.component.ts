import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { PatientMedicalCardModel } from '@features/patient-medical-card/models/patient-medical-card.model';
import { PatientService } from '@features/patients/services/patient.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-overview',
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent implements OnInit{
  patientService = inject(PatientService)

  patientMedicalCard = signal<PatientMedicalCardModel>({} as PatientMedicalCardModel)
  loading = signal(false)

  ngOnInit(): void {
    this.patientService.patientMedicalCardInfo$
    .subscribe((res) => {
         this.loading.set(res.loading)
         if(res.data) {
           this.patientMedicalCard.set(res.data)
         }
    })
  }
}
