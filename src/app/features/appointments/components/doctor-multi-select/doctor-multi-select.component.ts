import {
  Component,
  forwardRef,
  ChangeDetectionStrategy,
  signal,
  input,
  computed,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { OutsideClickDirective } from '@core/directives/outside-click.directive';
import { LucideAngularModule, X } from 'lucide-angular';
import { TranslocoPipe } from '@jsverse/transloco';
import { Doctor } from '@features/doctor/models/doctor';
import { HighlightPipe } from '@core/pipes/highlight.pipe';

@Component({
  selector: 'app-doctor-multi-select',
  templateUrl: './doctor-multi-select.component.html',
  styleUrls: ['./doctor-multi-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DoctorMultiSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    OutsideClickDirective,
    LucideAngularModule,
    TranslocoPipe,
    HighlightPipe,
  ],
})
export class DoctorMultiSelectComponent implements ControlValueAccessor {
  protected readonly X = X;

  doctors = input.required<Doctor[]>();

  opened = signal(false);

  selected = signal<Doctor[]>([]);

  searchQuery = signal('');

  filteredDoctors = computed(() => {
    const query = this.searchQuery()?.trim().toLowerCase();
    const doctors = this.doctors() ?? [];

    if (!query) return doctors;

    return doctors.filter(({ firstName, lastName }) => {
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  });

  private onChange = (value: any[]) => {};
  private onTouch = () => {};

  writeValue(value: any[]): void {
    this.selected.set(value || []);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  toggleDropdown() {
    this.opened.update((x) => !x);
    this.onTouch();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  isSelected(doc: Doctor) {
    return this.selected().some((d) => d.id === doc.id);
  }

  toggleSelect(doc: Doctor) {
    const exists = this.selected().some((d) => d.id === doc.id);

    if (exists) {
      this.selected.update((arr) => arr.filter((d) => d.id !== doc.id));
    } else {
      this.selected.update((arr) => [...arr, doc]);
    }

    this.onChange(this.selected());
  }

  removeChip(doc: Doctor) {
    this.selected.update((arr) => arr.filter((d) => d.id !== doc.id));
    this.onChange(this.selected());
  }

  public clear(): void {
    this.selected.set([]);
    this.onChange([]);
  }
}
