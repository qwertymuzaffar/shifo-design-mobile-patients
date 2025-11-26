import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';


@Component({
    selector: 'app-calendar',
    imports: [CommonModule, RouterModule],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent {
  lang = ''
  constructor(private translocoService: TranslocoService){
    this.lang = this.translocoService.getActiveLang()
  }

  currentDate = signal(new Date());
  weeks = signal<Date[][]>([]);

  ngOnInit() {
    this.generateCalendar();
  }

  nextMonth() {
    const date = this.currentDate();
    this.currentDate.set(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    this.generateCalendar();
  }

  prevMonth() {
    const date = this.currentDate();
    this.currentDate.set(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    this.generateCalendar();
  }

  generateCalendar() {
    const date = this.currentDate();
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const weeks: Date[][] = [];

    let current = new Date(start);
    current.setDate(current.getDate() - current.getDay());

    while (current <= end || current.getDay() !== 0) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    this.weeks.set(weeks);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isCurrentMonth(date: Date): boolean {
    const curr = this.currentDate();
    return (
      date.getMonth() === curr.getMonth() &&
      date.getFullYear() === curr.getFullYear()
    );
  }

  handleClick(event: any): void {
  }
}
