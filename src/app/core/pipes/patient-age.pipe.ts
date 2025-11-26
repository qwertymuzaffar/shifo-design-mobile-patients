import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatAge' })
export class AgePipe implements PipeTransform {
  transform(birthDate: string): string {
     const today = new Date();
     const dob = new Date(birthDate);

     const age = today.getFullYear() - dob.getFullYear();
     const lastDigit = age % 10;
     const lastTwoDigits = age % 100;

     if (lastDigit === 1 && lastTwoDigits !== 11) {
       return `${age} год`; // case 1: ends with 1, but not 11 → use "год"
     }

     if ([2, 3, 4].includes(lastDigit) && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) {
       return `${age} года`; // case 2: ends with 2, 3, 4, but not 12–14 → use "года"
     }

     return `${age} лет`; // case 3: everything else → use "лет"
  }
}
