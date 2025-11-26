import { Pipe, PipeTransform, inject } from '@angular/core';
import { AppointmentStatus } from "@features/appointments/models/appointment.model";
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'statusTranslate'
})
export class StatusTranslatePipe implements PipeTransform {
  private translocoService = inject(TranslocoService);

  transform(value: AppointmentStatus): string {
    switch (value) {
      case AppointmentStatus.SCHEDULED:
        return this.translocoService.translate('appointment-form.status_scheduled');
      case AppointmentStatus.COMPLETED:
        return this.translocoService.translate('appointment-form.status_completed');
      case AppointmentStatus.CANCELLED:
        return this.translocoService.translate('appointment-form.status_cancelled');
      case AppointmentStatus.TEMPORARY:
        return this.translocoService.translate('appointment-form.temporary');
      case AppointmentStatus.CANCELLED_FOREVER:
        return this.translocoService.translate('appointment-form.cancelled_forever');
      default:
        return value;
    }
  }
}
