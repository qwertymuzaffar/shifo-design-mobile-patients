
import { Component, inject, OnInit } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { LucideAngularModule, X, BadgeX, BadgeCheck, LucideIconData } from 'lucide-angular';
export type ToastType = 'success' | 'error';

export interface ToastDataInterface {
  type: ToastType;
  title: string;
  message: string;
  icon?: LucideIconData;
}

@Component({
  selector: 'app-toast',
  imports: [LucideAngularModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
  snackBarRef = inject(MatSnackBarRef);
  public data: ToastDataInterface = inject(MAT_SNACK_BAR_DATA);
  readonly X = X;

  ngOnInit(): void {
    this.data.icon =
      this.data.icon || (this.data.type === 'success' ? BadgeCheck : BadgeX);
  }
}
