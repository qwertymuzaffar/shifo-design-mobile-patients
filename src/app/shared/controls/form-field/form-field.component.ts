
import { Component, input } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  imports: [MatTooltipModule, TranslocoPipe],
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent {
  readonly label = input<string>('');
  readonly control = input.required<AbstractControl>();
  readonly isPassword = input<boolean>(false);

  get errorKey() {
    return Object.keys(this.control()?.errors ?? {})[0];
  }

  get required() {
    return this.control()?.hasValidator(Validators.required);
  }

}
