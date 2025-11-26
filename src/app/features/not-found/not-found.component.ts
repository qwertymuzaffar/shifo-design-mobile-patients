import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ArrowLeft, FileQuestion, Home, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-not-found',
  imports: [LucideAngularModule, TranslocoPipe],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  fileQuestion = FileQuestion
  home = Home
  arrowLeft = ArrowLeft
  location = inject(Location)
  router = inject(Router)

  back() {
    this.location.back()
  }

  backHome() {
    this.router.navigate(['/'])
  }
}
