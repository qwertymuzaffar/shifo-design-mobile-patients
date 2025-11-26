import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';


@Component({
    selector: 'app-dashboard-header',
    imports: [TranslocoPipe],
    templateUrl: './dashboard-header.component.html'
})
export class DashboardHeaderComponent {}
