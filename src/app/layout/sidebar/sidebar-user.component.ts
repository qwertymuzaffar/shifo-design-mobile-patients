import {Component, Input} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-sidebar-user',
  standalone: true,
  templateUrl: './sidebar-user.component.html',
  inputs: ['name', 'email'],
  imports: [
    NgClass
  ]
})
export class SidebarUserComponent {
  name!: string;
  email!: string;
  @Input() collapsed = false;
}
