import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Pagination } from '@models/pagination.model';
import { DatePipe } from '@angular/common';
import { FormFieldComponent } from '@shared/controls';
import { PaginationComponent } from '@shared/components';
import { PhoneFormatPipe } from '@core/pipes/phone-format.pipe';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PatientService } from '@features/patients/services/patient.service';
import { PatientModel } from '@features/patients/models/patient.model';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { DateRangePickerComponent } from '@shared/components/date-range-picker/date-range-picker';
import { LucideAngularModule, X } from 'lucide-angular';
import { OptionsScrollDirective } from '@shared/directives/option-scroll/options-scroll.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddPaymentDialogComponent } from './dialogs/add-payment-dialog/add-payment-dialog.component';
import { SkeletonComponent } from './skeleton/skeleton-payment.component';
import { PaymentService } from './services/payment.service';
import { Daum } from './models/payment.models';
import {
  AppointmentDetailsDialogComponent,
  AppointmentDialogData,
} from './dialogs/appointment-details-dialog/appointment-details-dialog.component';
import { NgxRolesService, NgxPermissionsModule } from 'ngx-permissions';
import { UserRole } from '@core/models/user.model';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { PaymentType } from '@core/models/payment.model';

@Component({
  selector: 'app-payment',
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    PaginationComponent,
    DatePipe,
    FormFieldComponent,
    PhoneFormatPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    DateRangePickerComponent,
    SkeletonComponent,
    LucideAngularModule,
    OptionsScrollDirective,
    NgxPermissionsModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  constructor(private transloco: TranslocoService) {}

  filterChanged = output<{
    from: Date | null;
    to: Date | null;
    filterByAppointmentDate: boolean;
  }>();
  toggleOptions = [
    { label: 'calendar-header.appointment', value: true },
    { label: 'calendar-header.balance', value: false },
  ];

  @ViewChild('dateField') dateField!: ElementRef;
  readonly isLoading = signal<boolean>(false);
  private paymentsService = inject(PaymentService);
  private patientService = inject(PatientService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private ngxRoleService = inject(NgxRolesService);
  protected readonly X = X;
  currentPage = 1;

  protected readonly PaymentType = PaymentType;

  isUserRoleReceptionist = this.ngxRoleService.getRole(UserRole.RECEPTIONIST)

  userRole = UserRole;
  searchText = '';
  patientControl = new FormControl<string>('');
  private destroyRef = inject(DestroyRef);
  isCalendarOpen = signal<boolean>(false);
  patients = signal<PatientModel[]>([]);
  loadPatient = signal(false);

  tempDates = signal<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });
  selectedDates = signal<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  form = new FormGroup({
    page: new FormControl<number>(1, { nonNullable: true }),
    limit: new FormControl<number>(10, { nonNullable: true }),
    status: new FormControl<string>('', { nonNullable: true }),
    paymentType: new FormControl<string>('', { nonNullable: true }),
    search: new FormControl('', { nonNullable: true }),
    filterByAppointmentDate: new FormControl(true),
  });

  data = signal<Pagination<Daum>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  patient = signal<Pagination<PatientModel>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  patientsLoad(reset = false): void {
    if (this.loadPatient()) return;
    if (reset) {
      this.currentPage = 1;
      this.patient.set({
        items: [],
        total: 0,
        page: 1,
        limit: this.patient().limit,
        totalPages: 0,
      });
    }

    const limit = this.patient().limit;
    const pagination = this.patient();
    if (pagination.total > 0 && pagination.items.length >= pagination.total) return;

    this.loadPatient.set(true);
    this.patientService.getPatients({
      search: this.searchText,
      page: this.currentPage,
      limit,
    }).pipe(
      finalize(() => this.loadPatient.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      this.patient.update(curr => ({
        ...curr,
        items: [...curr.items, ...res.items],
        total: res.total,
        totalPages: res.totalPages,
        page: this.currentPage,
      }));
      this.patients.set(this.patient().items);
      this.currentPage++;
    });
  }

  ngOnInit(): void {
    if(this.isUserRoleReceptionist) {
      this.selectedDates.set({from: new Date(), to: new Date()})
    }

    this.loadPayments();
    this.patientsLoad(true);

    this.form.controls['status'].valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.patchValue({ page: 1 }, { emitEvent: false });
        this.loadPayments();
      });

    this.form.controls['paymentType'].valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.patchValue({ page: 1 }, { emitEvent: false });
        this.loadPayments();
      });

    this.form.controls['page'].valueChanges
      .pipe(
        debounceTime(200),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadPayments();
      });

    this.form.controls['search'].valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.patchValue({ page: 1 }, { emitEvent: false });
        this.loadPayments();
      });

    this.patientControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.searchText = value || '';
        this.form.patchValue({ page: 1 }, { emitEvent: false });
        this.loadPayments();
      });
  }

  loadPayments(): void {
    this.isLoading.set(true);
    const { status, paymentType, page, limit, search } = this.form.value;
    const patientSearch = this.patientControl.value;
    const { from, to } = this.selectedDates();

    const query: any = {};
    if (status && status !== '') query.status = status;
    if (paymentType && paymentType !== '') query.paymentType = paymentType;
    if (page) query.page = page;
    if (limit) query.limit = limit;

    const searchTerms: string[] = [];
    if (search && search.trim() !== '') {
      searchTerms.push(search.trim());
    }
    if (patientSearch && patientSearch.trim() !== '') {
      searchTerms.push(patientSearch.trim());
    }

    if (searchTerms.length > 0) {
      query.search = searchTerms.join(' ');
    }

    if (from) query.dateFrom = this.formatDate(from);
    if (to) query.dateTo = this.formatDate(to);

    this.paymentsService.getPayments(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.data.set({
          items: response.data,
          total: response.count,
          page: page || 1,
          limit: limit || 10,
          totalPages: Math.ceil(response.count / (limit || 10)),
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  public pageChange(page: number): void {
    this.form.patchValue({ page });
  }

  openAppointmentModal(payment: Daum): void {
    const data: AppointmentDialogData = {
      payment: payment,
    };

    this.dialog.open(AppointmentDetailsDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: data
    });
  }

  openAddPaymentDialog() {
    this.dialog.open(AddPaymentDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: {
        onSuccess: () => this.loadPayments()
      }
    });
  }

  filteredPatients(): PatientModel[] {
    const value = this.patientControl.value?.toLowerCase() || '';
    return this.patients().filter((patient) =>
      patient.fullName.toLowerCase().includes(value),
    );
  }

  openCalendar(): void {
    this.tempDates.set({ ...this.selectedDates() });
    this.isCalendarOpen.set(true);
  }

  closeCalendar(): void {
    this.isCalendarOpen.set(false);
  }

  onDatesChange(dates: { from: Date | null; to: Date | null }): void {
    this.tempDates.set(dates);
  }

  applyDates(): void {
    this.filterChanged.emit({
      ...this.tempDates(),
      filterByAppointmentDate: this.form.value[
        'filterByAppointmentDate'
      ] as boolean,
    });
    this.selectedDates.set({ ...this.tempDates() });
    this.isCalendarOpen.set(false);
    this.form.patchValue({ page: 1 }, { emitEvent: false });
    this.loadPayments();
  }

  clearDates(): void {
    this.selectedDates.set({ from: null, to: null });
    this.tempDates.set({ from: null, to: null });
    this.form.patchValue({ page: 1 }, { emitEvent: false });
  }

  clearPatient(): void {
    this.patientControl.setValue('', { emitEvent: false });
    this.form.patchValue({ page: 1 }, { emitEvent: false });
  }

  selectPeriodDict: { [lang: string]: string } = {
    ru: 'Выберите период',
    en: 'Select period'
  };
  fromTo: {[lang: string]: string } = {
    ru: 'С',
    en: 'From'
  }
  ruEN:{[lang: string]: string } = {
    ru: 'ru-RU',
    en: 'en-EN'
  }

  get dateRangeText(): string {
    const lang = this.transloco.getActiveLang();
    const { from, to } = this.selectedDates();
    if (!from && !to) return this.selectPeriodDict[lang];
    if (from && !to) return `${this.fromTo[lang]} ${from.toLocaleDateString(this.ruEN[lang])}`;
    if (from && to)
      return `${from.toLocaleDateString(this.ruEN[lang])} - ${to.toLocaleDateString(this.ruEN[lang])}`;
    return this.selectPeriodDict[lang];
  }

  calculateCalendarPosition(): string {
    if (this.dateField) {
      const rect = this.dateField.nativeElement.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const calendarWidth = 600;

      if (rect.right + calendarWidth > windowWidth) {
        return '0px';
      }
    }
    return 'auto';
  }

  private formatDate(date: Date): string {
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);

    const year = dateCopy.getFullYear();
    const month = String(dateCopy.getMonth() + 1).padStart(2, '0');
    const day = String(dateCopy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  clearFilter() {
    this.clearDates();
    this.clearPatient();
    this.form.reset();
    this.form.patchValue({
      filterByAppointmentDate: true,
    })
    this.patientControl.reset();
    this.filterChanged.emit({
      from: null,
      to: null,
      filterByAppointmentDate: true,
    });
  }

  public limitChange(limit: number): void {
    this.form.patchValue({ limit, page: 1 });
    this.router.navigate([], {
      queryParams: {
        ...this.activatedRoute.snapshot.queryParams,
        limit,
        page: 1,
      },
    });
  }

  public handleToggleOption(): void {
    this.filterChanged.emit({
      ...this.tempDates(),
      filterByAppointmentDate: this.form.getRawValue()
        .filterByAppointmentDate as boolean,
    });
  }
}
