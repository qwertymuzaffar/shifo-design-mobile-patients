import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'phoneFormat' })
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    let cleaned = value.replace(/(?!^\+)[^0-9]/g, '');

    const countryCodeMatch = cleaned.match(/^(\+\d{1,3})?(\d+)/);
    if (!countryCodeMatch) return value;

    const countryCode = countryCodeMatch[1] || '+992';
    const number = countryCodeMatch[2];

    let formattedNumber = '';
    if (number.length >= 2) {
      formattedNumber += '(' + number.substring(0, 2) + ')';
    }
    if (number.length > 2) {
      formattedNumber += ' ' + number.substring(2, 5);
    }
    if (number.length > 5) {
      formattedNumber += ' ' + number.substring(5, 7);
    }
    if (number.length > 7) {
      formattedNumber += ' ' + number.substring(7, 9);
    }

    return countryCode + ' ' + formattedNumber;
  }
}
