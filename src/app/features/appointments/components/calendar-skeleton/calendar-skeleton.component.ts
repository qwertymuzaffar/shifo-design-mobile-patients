
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-calendar-skeleton',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './calendar-skeleton.component.html',
  styleUrls: ['./calendar-skeleton.component.scss']
})
export class CalendarSkeletonComponent {
}

