import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-efficiency-badge',
  imports: [],
  templateUrl: './efficiency-badge.component.html',
  styleUrl: './efficiency-badge.component.scss',
})
export class EfficiencyBadgeComponent {
  efficiency = input.required<string | number>();

  readonly efficiencyValue = computed(() => {
    const value = this.efficiency();
    return typeof value === 'string' ? parseFloat(value) : value;
  });

  readonly isLowEfficiency = computed(() => {
    return this.efficiencyValue() < 70;
  });

  readonly badgeClasses = computed(() => {
    return this.isLowEfficiency()
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';
  });
}

