import { Component, input, output, OnInit, signal, computed, inject, effect } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-date-range-picker',
  imports: [],
  templateUrl: './date-range-picker.html',
  styleUrl: './date-range-picker.scss'
})
export class DateRangePickerComponent implements OnInit {
  daysOfWeek: string[] = [];
  months: string[] = [];

  selectedDates = input<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  datesChange = output<{ from: Date | null; to: Date | null }>();

  private transloco = inject(TranslocoService);

  leftMonth = signal<Date>(new Date());
  rightMonth = signal<Date>(new Date());
  currentMobileMonth = signal<Date>(new Date());

  constructor() {
    if (this.transloco.getActiveLang() === 'ru') {
      this.daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      this.months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];
    } else {
      this.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      this.months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
    }

    effect(() => {
      this.selectedDates();
      this.initializeMonths();
    });
  }

  ngOnInit(): void {
    this.initializeMonths();
  }

  initializeMonths(): void {
    const dates = this.selectedDates();
    if (dates.from) {
      const fromDate = new Date(dates.from);
      const toDate = dates.to ? new Date(dates.to) : fromDate;

      const fromMonth = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
      const toMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

      if (fromMonth.getTime() === toMonth.getTime()) {
        this.leftMonth.set(fromMonth);
        this.rightMonth.set(new Date(fromMonth.getFullYear(), fromMonth.getMonth() + 1, 1));
        this.currentMobileMonth.set(fromMonth);
      } else {
        this.leftMonth.set(fromMonth);
        this.rightMonth.set(toMonth);
        this.currentMobileMonth.set(fromMonth);
      }
    } else {
      const now = new Date();
      this.leftMonth.set(now);
      this.rightMonth.set(new Date(now.getFullYear(), now.getMonth() + 1, 1));
      this.currentMobileMonth.set(now);
    }
  }

  generateMonthDays(month: Date): { day: Date; isCurrentMonth: boolean }[] {
    const currentMonth = month.getMonth();
    const currentYear = month.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const isCurrentMonth = day.getMonth() === currentMonth && day.getFullYear() === currentYear;
      days.push({ day, isCurrentMonth });
    }
    return days;
  }

  selectDate(date: Date, calendarIndex: number): void {
    const clickedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    clickedDate.setHours(0, 0, 0, 0);

    const currentDates = { ...this.selectedDates() };

    if (!currentDates.from) {
      currentDates.from = clickedDate;
      currentDates.to = null;
    } else if (currentDates.from && !currentDates.to) {
      if (clickedDate.getTime() >= currentDates.from.getTime()) {
        currentDates.to = clickedDate;
      } else {
        currentDates.to = currentDates.from;
        currentDates.from = clickedDate;
      }
    } else if (currentDates.from && currentDates.to) {
      if (this.datesAreEqual(clickedDate, currentDates.from) || this.datesAreEqual(clickedDate, currentDates.to)) {
        currentDates.from = clickedDate;
        currentDates.to = clickedDate;
      } else if (clickedDate.getTime() < currentDates.from.getTime()) {
        currentDates.from = clickedDate;
      } else if (clickedDate.getTime() > currentDates.to.getTime()) {
        currentDates.from = currentDates.to;
        currentDates.to = clickedDate;
      } else {
        const fromDiff = Math.abs(clickedDate.getTime() - currentDates.from.getTime());
        const toDiff = Math.abs(clickedDate.getTime() - currentDates.to.getTime());

        if (fromDiff < toDiff) {
          currentDates.from = clickedDate;
        } else {
          currentDates.to = clickedDate;
        }
      }
    }

    this.ensureVisible(currentDates.from, currentDates.to);
    this.datesChange.emit(currentDates);
  }

  datesAreEqual(d1: Date | null, d2: Date | null): boolean {
    if (!d1 || !d2) return false;
    const d1Time = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const d2Time = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    return d1Time === d2Time;
  }

  ensureVisible(from: Date | null, to: Date | null): void {
    if (!from) return;

    let minDate = from;
    let maxDate = to || from;

    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    if (minMonth.getTime() === maxMonth.getTime()) {
      this.leftMonth.set(minMonth);
      this.rightMonth.set(new Date(minMonth.getFullYear(), minMonth.getMonth() + 1, 1));
      this.currentMobileMonth.set(minMonth);
    } else {
      this.leftMonth.set(minMonth);
      this.rightMonth.set(maxMonth);
      this.currentMobileMonth.set(minMonth);
    }
  }

  isStart(date: Date): boolean {
    const dates = this.selectedDates();
    if (!dates.from) return false;
    return this.datesAreEqual(dates.from, date);
  }

  isEnd(date: Date): boolean {
    const dates = this.selectedDates();
    if (!dates.to) return false;
    return this.datesAreEqual(dates.to, date);
  }

  isInRange(date: Date): boolean {
    const dates = this.selectedDates();
    if (!dates.from || !dates.to) return false;
    const dateTime = date.getTime();
    const fromTime = dates.from.getTime();
    const toTime = dates.to.getTime();
    return dateTime > fromTime && dateTime < toTime;
  }

  isRangeStart(date: Date, calendarIndex: number): boolean {
    const dates = this.selectedDates();
    if (!dates.from || !dates.to) return false;
    if (!this.isInRange(date)) return false;

    const month = calendarIndex === 0 ? this.leftMonth() : this.rightMonth();
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);

    return (date.getTime() === firstDayOfMonth.getTime() ||
            !this.isInRange(prevDay) ||
            prevDay.getMonth() !== date.getMonth());
  }

  isRangeEnd(date: Date, calendarIndex: number): boolean {
    const dates = this.selectedDates();
    if (!dates.from || !dates.to) return false;
    if (!this.isInRange(date)) return false;

    const month = calendarIndex === 0 ? this.leftMonth() : this.rightMonth();
    const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return (date.getTime() === lastDayOfMonth.getTime() ||
            !this.isInRange(nextDay) ||
            nextDay.getMonth() !== date.getMonth());
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  nextMonth(): void {
    const newLeftMonth = new Date(this.leftMonth().getFullYear(), this.leftMonth().getMonth() + 1, 1);
    this.leftMonth.set(newLeftMonth);
    this.rightMonth.set(new Date(newLeftMonth.getFullYear(), newLeftMonth.getMonth() + 1, 1));
  }

  prevMonth(): void {
    const newLeftMonth = new Date(this.leftMonth().getFullYear(), this.leftMonth().getMonth() - 1, 1);
    this.leftMonth.set(newLeftMonth);
    this.rightMonth.set(new Date(newLeftMonth.getFullYear(), newLeftMonth.getMonth() + 1, 1));
  }

  nextMobileMonth(): void {
    this.currentMobileMonth.update(month => new Date(month.getFullYear(), month.getMonth() + 1, 1));
  }

  prevMobileMonth(): void {
    this.currentMobileMonth.update(month => new Date(month.getFullYear(), month.getMonth() - 1, 1));
  }
}
