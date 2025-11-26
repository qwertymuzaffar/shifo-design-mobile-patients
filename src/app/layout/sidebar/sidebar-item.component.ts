import {NgClass,} from '@angular/common';
import {Component, Input} from '@angular/core';
import {
  LucideAngularModule,
  FileIcon,
  House,
  LucideIconData,
} from 'lucide-angular';

@Component({
    selector: 'app-sidebar-item',
    templateUrl: './sidebar-item.component.html',
    imports: [NgClass, LucideAngularModule],
    inputs: ['icon', 'label', 'active']
})
export class SidebarItemComponent {
  icon!: LucideIconData;
  readonly FileIcon = FileIcon;
  readonly House = House;
  @Input() collapsed = false;
  @Input() active = false;
  @Input() label = '';


}
