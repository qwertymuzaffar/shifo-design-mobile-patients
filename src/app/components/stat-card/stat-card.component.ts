import { CommonModule } from '@angular/common';
import {Component, computed, input, InputSignal} from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

type iconBgColorType = | 'green' | 'gray' | 'blue' | 'sky' | 'amber' | 'emerald' | 'purple' | 'rose'

@Component({
  selector: 'app-stat-card',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  icon = input<LucideIconData>();
  tendIcon = input<LucideIconData>();
  tendText = input();
  textGrowth = input() ;
  label = input();
  value = input();

  iconBgColor: InputSignal<iconBgColorType> = input<iconBgColorType>("gray")
  iconItemColor = input(this.iconBgColor());
  tendIconColor = input(this.iconItemColor());
  tendTextColor = input(this.tendIconColor());
  valueColor = input(this.iconBgColor())
  loading = input(false);


  readonly COLOR_MAP = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    sky: {
      bg: 'bg-sky-100',
      text: 'text-sky-600',
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
    },
    rose: {
      bg: 'bg-rose-100',
      text: 'text-rose-600',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600'
    }
  };

  tendTextClass = computed(() => this.COLOR_MAP[this.tendTextColor()] || {
        bg: 'bg-green-100',
        text: 'text-green-600',
  })

  tendIconClass = computed(() => this.COLOR_MAP[this.tendIconColor()] || {
        bg: 'bg-green-100',
        text: 'text-green-600',
  });

  iconBgClass = computed(() => this.COLOR_MAP[this.iconBgColor()] ||{
        bg: 'bg-sky-100',
        text: 'text-sky-600',
  });

  iconItemClass = computed(() => this.COLOR_MAP[this.iconItemColor()] || {
        bg: 'bg-sky-100',
        text: 'text-sky-600',
      }
  )

  valueClass = computed(() => this.COLOR_MAP[this.valueColor()] || {
        bg: 'bg-sky-100',
        text: 'text-gray-900',
  })
}
