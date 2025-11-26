import { Doctor } from "@features/doctor/models/doctor"
import { Appointment } from "@features/finances/components/payment/models/payment.models"
import { PatientModel } from "@features/patients/models/patient.model"

export type PatientStatusType = "SCHEDULED"

export interface PatientMedicalCardModel {
  patient: PatientMedical,
  appointments: PatientAppointment[],
  stats: {
    totalVisits: number,
    completedVisits: number,
    documents: number,
    pendingDocuments: number
  },
  recentDocuments: PatientDocumentModel[],
  lastVisit: PatientVisitModel,
  nextVisit: PatientVisitModel,
}

export interface PatientDocumentModel {
  createdAt: string,
  updatedAt: string,
  id: number,
  description: string,
  patientId: number,
  status: string,
  title: string,
  fileSize: string,
  fileUrl: string,
  documentType: {
    id: number,
    name: string,
    createdAt: string,
    updatedAt: string
  }
}

export interface PatientMedical extends PatientModel {
    status: number,
    balance: string,
    createdAt: string,
    updatedAt: string,
    email?: string
}

export interface PatientVisitModel {
    id: number,
    time: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    patientId: number,
    duration: number,
    notes: string,
    symptoms: string,
    status: PatientStatusType,
    type: string,
    cancellationReason: string | null,
    doctor: PatientLastVisitDoctor,
    recentDocuments: [],
    appointments: PatientAppointment
}

export interface PatientLastVisitDoctor extends Doctor {
      userId: number,
      status: number,
      createdAt: string,
      updatedAt: string,
      fullName: string,
      firstName: string,
      lastName: string
}

type AppointmentType = Omit<Appointment, "doctor" | "patient">

export type PatientAppointment = AppointmentType & {
  cancellationReason: string,
  doctor: PatientLastVisitDoctor
}
