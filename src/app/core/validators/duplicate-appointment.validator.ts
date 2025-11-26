import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AppointmentModel } from '@models/appointment.model';

export function duplicateAppointmentValidator(
  appointments: AppointmentModel[] = [],
  currentDoctorIdGetter: () => number | null,
  currentDateGetter: () => string | null,
  currentId: number | null = null
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selectedTime = control.value;
    const doctorId = currentDoctorIdGetter();
    const date = currentDateGetter();

    if (!selectedTime || !doctorId || !date) return null;

    for (const appointment of appointments) {
      if (
        appointment.id !== currentId &&
        appointment.doctor.id === doctorId &&
        appointment.date === date &&
        appointment.time === selectedTime
      ) {
        return { duplicateAppointment: true };
      }
    }

    return null;
  };
}
