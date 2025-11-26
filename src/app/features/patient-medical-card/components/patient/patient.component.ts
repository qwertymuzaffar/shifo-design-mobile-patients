import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { InitialsPipe } from '@core/pipes/initials.pipe';
import { AgePipe } from '@core/pipes/patient-age.pipe';
import { PatientMedicalCardModel } from '@features/patient-medical-card/models/patient-medical-card.model';
import { PatientService } from '@features/patients/services/patient.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-patient',
  imports: [InitialsPipe, AgePipe, TranslocoPipe],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientComponent {
  patientService = inject(PatientService)

  patient = rxResource({
    stream: () => this.patientService.patientMedicalCardInfo$,
    defaultValue: {loading: false, data: {} as PatientMedicalCardModel}
  })
}
