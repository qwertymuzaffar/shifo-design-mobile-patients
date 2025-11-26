import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormFieldComponent } from '@shared/controls';
import {
  LucideAngularModule,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-angular';
import { NgClass } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { PatientService } from '@features/patients/services/patient.service';
import { DoctorService } from '@core/services/doctor.service';
import { Pagination } from '@models/pagination.model';
import { PatientModel } from '@features/patients/models/patient.model';
import { tap } from 'rxjs/operators';
import { Doctor } from '@features/doctor/models/doctor';
import { OptionsScrollDirective } from '@shared/directives/option-scroll/options-scroll.directive';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule, NgxRolesService } from "ngx-permissions";
import { UserRole } from '@core/models/user.model';
import { UserService } from '@core/services/user.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  DoctorMultiSelectComponent
} from '@features/appointments/components/doctor-multi-select/doctor-multi-select.component';

enum FilterKey {
  PATIENT_ID = 'patientId',
  DOCTOR_ID = 'doctorId',
}

@Component({
  selector: 'app-calendar-header',
  imports: [
    TranslocoPipe,
    LucideAngularModule,
    NgClass,
    FormFieldComponent,
    ReactiveFormsModule,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
    OptionsScrollDirective,
    NgxPermissionsModule,
    DoctorMultiSelectComponent,
  ],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss'],
})
export class CalendarHeaderComponent implements OnInit {
  constructor(private translocoService: TranslocoService) {
    // следим за изменением языка и обновляем сигнал
    this.translocoService.langChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang) => {
        this.currentLang.set(lang);
      });
  }

  currentLang = signal(this.translocoService.getActiveLang());

  currentDate = input<Date>(new Date());
  viewMode = input<'week' | 'day'>('week');
  doctors = input.required<Doctor[]>();
  readonly isShowClearFilter = input<boolean>(false);
  navigate = output<'prev' | 'next'>();
  setCurrentDate = output();
  setViewMode = output<'week' | 'day'>();
  patientControl = new FormControl<string>('');
  doctorControl = new FormControl<any[]>([]);
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  readonly filterKey = FilterKey;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  private userService = inject(UserService);

  protected readonly X = X;
  private currentPatientPage = 1;

  readonly loadPatient = signal(false);
  private destroyRef = inject(DestroyRef);
  private ngxRoleService = inject(NgxRolesService);

  ngOnInit() {
    this.loaderPatients();
    this.patientControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.loaderPatients(true)),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.doctorControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(doctors => {
        if (Array.isArray(doctors)) {
          this.router.navigate([], {
            queryParams: doctors.length ? {
              doctorIds: doctors.map(doc => doc.id).join(','),
            }: {}
          })
        }
      });
  }

  patientDataPagination = signal<Pagination<PatientModel>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  public selectEvent(key: FilterKey, value: number) {
    this.router.navigate([], {
      queryParams: { [key]: value },
      queryParamsHandling: 'merge',
    });
  }

  public clearFilterByKey(key: FilterKey): void {
    const queryParams = { ...this.route.snapshot.queryParams };

    this.resetControlByKey(key);
    delete queryParams[key];

    this.updateQueryParams(queryParams);
  }

  public clearFilter(): void {
    this.resetAllControls();
    this.updateQueryParams({});
  }

  private resetControlByKey(key: FilterKey): void {
    const controlMap: Record<FilterKey, () => void> = {
      [FilterKey.PATIENT_ID]: () => this.patientControl.setValue(''),
      [FilterKey.DOCTOR_ID]: () => this.doctorControl.setValue([]),
    };

    controlMap[key]?.();
  }

  private resetAllControls(): void {
    this.patientControl.setValue('');
    if (!this.doctorControl.disabled) {
      this.doctorControl.setValue([]);
    }
  }

  private updateQueryParams(params: Record<string, any>): void {
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'replace',
    });
  }

   calendarTitle = computed(() => {
    // когда меняется currentLang → пересчитывается всё ниже
    const locale =
      this.currentLang() === 'ru' ? 'ru-RU' : 'en-US';

    if (this.viewMode() === 'week') {
      const startWeek = new Date(this.currentDate());
      const day = startWeek.getDay();
      const diff = startWeek.getDate() - day + (day === 0 ? -6 : 1);
      startWeek.setDate(diff);

      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startWeek);
        date.setDate(startWeek.getDate() + i);
        days.push(date);
      }

      const startDate = days[0];
      const endDate = days[6];
      const startMonth = startDate.toLocaleDateString(locale, { month: 'long' });
      const endMonth = endDate.toLocaleDateString(locale, { month: 'long' });
      const year = startDate.getFullYear();

      if (startMonth !== endMonth) {
        const startMonthShort = startDate.toLocaleDateString(locale, { month: 'short' });
        const endMonthShort = endDate.toLocaleDateString(locale, { month: 'short' });
        return `${startMonthShort} - ${endMonthShort} ${year}`;
      }

      return `${startMonth} ${year}`;
    }

    return this.currentDate().toLocaleDateString(locale, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  });


  loaderPatients(reset = false) {
    if (this.loadPatient()) return;

    if (reset) {
      this.currentPatientPage = 1;
      this.patientDataPagination.set({
        items: [],
        total: 0,
        page: 1,
        limit: this.patientDataPagination().limit,
        totalPages: 0,
      });
    }

    const pagination = this.patientDataPagination();
    if (pagination.total > 0 && pagination.items.length >= pagination.total) {
      return;
    }
    this.loadPatient.set(true);

    this.patientService
      .getPatients({
        search: this.patientControl.value || '',
        page: this.currentPatientPage,
        limit: this.patientDataPagination().limit,
      })
      .pipe(finalize(() => this.loadPatient.set(false)),
            takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.patientDataPagination.update((curr) => ({
          ...curr,
          items: [...curr.items, ...res.items],
          total: res.total,
          totalPages: res.totalPages,
          page: this.currentPatientPage,
        }));
        this.currentPatientPage++;
      });
  }
}
