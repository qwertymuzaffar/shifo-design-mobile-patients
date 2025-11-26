import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'shifo';
  private transloco = inject(TranslocoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

ngOnInit() {

  this.route.queryParams
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(params => {
      const lang = params['lang'];
      if (lang && ['ru', 'en'].includes(lang)) {
        this.transloco.setActiveLang(lang);
      }
    });

  this.router.events
    .pipe(
      filter(event => event instanceof NavigationStart),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe((event: any) => {
      const url = new URL(window.location.origin + event.url);
      const hasLang = url.searchParams.has('lang');
      const currentLang = this.transloco.getActiveLang();

      if (!hasLang && currentLang) {
        const separator = event.url.includes('?') ? '&' : '?';
        this.router.navigateByUrl(`${event.url}${separator}lang=${currentLang}`, {
          replaceUrl: true
        });
      }
    });
  }


  setLang(lang: string) {
    this.transloco.setActiveLang(lang);
    this.router.navigate([], {
      queryParams: { lang },
      queryParamsHandling: 'merge',
    });
  }
}
