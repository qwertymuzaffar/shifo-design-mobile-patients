import { Routes } from "@angular/router";

export const PATIENT_MEDICAL_CARD_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./patient-medical-card.component").then((c) => c.PatientMedicalCardComponent),
    children: [
          {path: "", redirectTo: "overview", pathMatch: "full"},
          {path: "overview", loadComponent: () => import("./components/overview/overview.component").then((c) => c.OverviewComponent)},
          {path: "patient", loadComponent: () => import("./components/patient/patient.component").then((c) => c.PatientComponent)},
          {path: "visits", loadComponent: () => import("./components/visit/visit.component").then((c) => c.VisitComponent)},
          {path: "documents", loadComponent: () => import("./components/documents/documents.component").then((c) => c.DocumentsComponent)},
          {path: "settings", loadComponent: () => import("./components/settings/settings.component").then((c) => c.SettingsComponent)}
        ]
  }
]
