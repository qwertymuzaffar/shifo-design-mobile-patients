import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'addMinutes' })
export class AddMinutesPipe implements PipeTransform {
  transform(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(mins + minutes);
    return date.toTimeString().slice(0, 5);
  }
}
