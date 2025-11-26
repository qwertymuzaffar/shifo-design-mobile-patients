import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';


@Component({
  selector: 'app-calendar-legend',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: "./calendar-legend.component.html",
  styleUrls: ['./calendar-legend.component.scss'],
})
export class CalendarLegendComponent {}
