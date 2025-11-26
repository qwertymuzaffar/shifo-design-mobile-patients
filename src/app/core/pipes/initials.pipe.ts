import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(fullName: string): string {
    if (!fullName) return '';

    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }
}
