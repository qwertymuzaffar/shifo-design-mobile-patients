import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '@layout/sidebar/sidebar.component';
import { MobileHeaderComponent } from '@shared/components/mobile-header/mobile-header.component';

@Component({
    selector: 'app-layout',
    imports: [RouterOutlet, SidebarComponent, MobileHeaderComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent {
}
