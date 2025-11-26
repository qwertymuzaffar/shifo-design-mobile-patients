import {Component, Inject} from '@angular/core';
import {AppointmentModel} from "@models/appointment.model";
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";
import {CommonModule} from "@angular/common";
import {PhoneFormatPipe} from "@core/pipes/phone-format.pipe";
import { TypeTranslatePipe } from '@core/pipes/type-translate.pipe';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';


enum WorkingDays {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

@Component({
  selector: 'dash-dialog',
  standalone: true,
  templateUrl: './dash-dialog.component.html',
  styleUrls: ['./dash-dialog.component.scss'],
  imports: [TranslocoPipe, CommonModule, MatDialogClose, PhoneFormatPipe, TypeTranslatePipe]
})

export class DashDialogComponent  {

  lang = "";
  constructor(@Inject(MAT_DIALOG_DATA) public data: AppointmentModel, private serviceTransloco: TranslocoService) {
    this.lang = this.serviceTransloco.getActiveLang();
  }

  public weekDays: { [lang: string]: { label: string; value: WorkingDays }[] } = {
    ru: [
      { label: 'Пн', value: WorkingDays.Monday },
      { label: 'Вт', value: WorkingDays.Tuesday },
      { label: 'Ср', value: WorkingDays.Wednesday },
      { label: 'Чт', value: WorkingDays.Thursday },
      { label: 'Пт', value: WorkingDays.Friday },
      { label: 'Сб', value: WorkingDays.Saturday },
      { label: 'Вс', value: WorkingDays.Sunday },
    ],
    en: [
      { label: 'Mon', value: WorkingDays.Monday },
      { label: 'Tue', value: WorkingDays.Tuesday },
      { label: 'Wed', value: WorkingDays.Wednesday },
      { label: 'Thu', value: WorkingDays.Thursday },
      { label: 'Fri', value: WorkingDays.Friday },
      { label: 'Sat', value: WorkingDays.Saturday },
      { label: 'Sun', value: WorkingDays.Sunday },
    ]
  };


  public get workDays(): number[] {
    return this.data?.doctor?.workingHours?.workingDays ?? [];
  }
}
