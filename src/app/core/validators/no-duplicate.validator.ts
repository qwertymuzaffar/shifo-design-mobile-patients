import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {AppointmentModel} from "@models/appointment.model";

export function noDuplicateCommaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;

    if (!value) {
      return null;
    }

    const hasDuplicateCommas = /,,+/.test(value);

    return hasDuplicateCommas ? { duplicateComma: 'Недопустимо несколько запятых подряд' } : null;
  };
}

export function duplicateAppointmentValidator(
  existingAppointments: AppointmentModel[],
  currentAppointmentId?: number
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const doctorId = formGroup.get('doctorId')?.value;
    const date = formGroup.get('date')?.value;
    const time = formGroup.get('time')?.value;

    const timeControl = formGroup.get('time');
    const doctorControl = formGroup.get('doctorId');

    if (!doctorId || !date || !time) {
      return null;
    }
    const isDuplicate = existingAppointments.some(a => {
      if (a.id === currentAppointmentId) {
        return false;
      }
      return (
        a.doctor?.id === doctorId &&
        a.date === date &&
        a.time === time
      );
    });

    if (isDuplicate) {
      timeControl?.setErrors({
        ...timeControl.errors,
        duplicateAppointment: true,
      });

      return { duplicateAppointment: true };
    } else {
      if (timeControl?.hasError('duplicateAppointment')) {
        const { duplicateAppointment, ...rest } = timeControl.errors || {};
        timeControl.setErrors(Object.keys(rest).length ? rest : null);
      }

      return null;
    }
  };
}
