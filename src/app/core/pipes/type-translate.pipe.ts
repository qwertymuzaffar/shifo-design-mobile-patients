import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typeTranslate',
})
export class TypeTranslatePipe implements PipeTransform {
  transform(value: string): string {
    switch (value?.toLowerCase()) {
      case 'consultation':
        return 'Консультация';
      case 'followup':
        return 'Повторный прием';
      case 'procedure':
        return 'Процедура';
      case 'emergency':
        return 'Экстренный прием';
      default:
        return value || 'Не указан';
    }
  }
}
