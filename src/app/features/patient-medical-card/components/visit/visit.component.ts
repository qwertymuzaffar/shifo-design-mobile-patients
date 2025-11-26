import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { StatusTranslatePipe } from '@core/pipes/translate.pipe';
import { TypeTranslatePipe } from '@core/pipes/type-translate.pipe';
import { PatientMedicalCardModel } from '@features/patient-medical-card/models/patient-medical-card.model';
import { PatientService } from '@features/patients/services/patient.service';
import { AppointmentStatus } from '@features/appointments/models/appointment.model';
import { LucideCheckCircle, LucideEdit, LucideXCircle, LucideAngularModule, LucideClock } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-visit',
  imports: [TypeTranslatePipe, StatusTranslatePipe, CommonModule, LucideAngularModule, TranslocoPipe],
  templateUrl: './visit.component.html',
  styleUrl: './visit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitComponent {
  patientService = inject(PatientService);
  appointmentStatus = AppointmentStatus;

  protected readonly CheckCircle = LucideCheckCircle;
  protected readonly XCircle = LucideXCircle;
  protected readonly Edit = LucideEdit;
  protected readonly Clock = LucideClock;


  appointments = rxResource({
    stream: () => this.patientService.patientMedicalCardInfo$,
    defaultValue: {loading: false, data: {} as PatientMedicalCardModel}
  })
}
