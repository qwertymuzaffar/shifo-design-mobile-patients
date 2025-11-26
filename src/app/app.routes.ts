import { Routes } from "@angular/router";
import { AUTH_GUARD } from "@core/guards/auth.guard";
import { UserRole } from "@core/models/user.model";
import { ngxPermissionsGuard, NgxPermissionsGuard } from "ngx-permissions";

export const routes: Routes = [
   {
      path: "login",
      loadComponent: () => import("./login/login.component").then((m) => m.LoginComponent),
   },
   {
      path: "",
      loadComponent: () => import("./layout/layout.component").then((m) => m.LayoutComponent),
      canActivate: [AUTH_GUARD],
      canActivateChild: [AUTH_GUARD],
      children: [
         {
            path: "dashboard",
            loadComponent: () => import("@features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
         },
         {
            path: "calendar",
            loadComponent: () => import("@features/calendar/calendar.component").then((m) => m.CalendarComponent),
            pathMatch: "full",
         },
         {
            path: "doctor",
            loadComponent: () => import("@features/doctor/doctor.component").then((m) => m.DoctorComponent),
            pathMatch: "full",
         },
         {
            path: "patients",
            loadComponent: () => import("@features/patients/patients.component").then((m) => m.PatientsComponent),
            pathMatch: "full",
         },
         {
            path: "patients/:patient_id",
            loadChildren: () =>
               import("./features/patient-medical-card/patient-medical-card.routes").then((r) => r.PATIENT_MEDICAL_CARD_ROUTES),
         },
         {
            path: "appointments",
            loadComponent: () => import("@features/appointments/appointments.component").then((m) => m.AppointmentsComponent),
            pathMatch: "full",
         },
         {
            path: "smart-scheduler",
            loadComponent: () => import("@features/smart-scheduler/smart-scheduler.component").then((m) => m.SmartSchedulerComponent),
            pathMatch: "full",
         },
          {
            path: "finances",
            loadComponent: () => import("@features/finances/finances.component").then((c) => c.FinancesComponent),
            pathMatch: "full",
         },
         {
            path: "analytics",
            loadComponent: () => import("@features/analytics/analytics.component").then((m) => m.AnalyticsComponent),
            canActivate: [ngxPermissionsGuard],
            data: {
              permissions: {
                only: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.ACCOUNTANT],
                redirectTo: "patients"
              }
            },
            pathMatch: "full",
         },
         { path: "", redirectTo: "patients", pathMatch: "full" },
      ],
   },
   {
      path: "**",
      loadComponent: () => import("./features/not-found/not-found.component").then((c) => c.NotFoundComponent),
  },
];
