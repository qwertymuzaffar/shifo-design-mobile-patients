import { AbstractControl, ValidationErrors } from "@angular/forms";

const COMPOSITION_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export function passwordCompositionValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  return COMPOSITION_REGEX.test(value) ? null : { passwordCompositionPattern: true };
}
