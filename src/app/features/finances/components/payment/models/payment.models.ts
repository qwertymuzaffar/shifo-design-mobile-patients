import { AppointmentStatus } from "@features/appointments/models/appointment.model"

export interface Payments {
  data: Daum[]
  count: number
}

export interface Daum {
  id: number
  appointmentId: number | null
  amount: string
  method: string
  paymentType: string
  paymentKind: string
  status: string
  createdAt: string
  paidAt: any
  updatedAt: string
  appointment: Appointment
  patient?: Patient
}

export interface Appointment {
  id: number
  time: string
  date: string
  createdAt: string
  updatedAt: string
  patientId: number
  duration: number
  notes: string
  symptoms: string
  status: AppointmentStatus
  type: string
  patient: Patient
  doctor: Doctor
}

export interface Patient {
  id: number
  fullName: string
  phone: string
  address: string
  emergencyContact: string
  allergies: string[]
  medicalHistory: string
  birthDate: string
  createdAt: string
  updatedAt: string
}

export interface Doctor {
  id: number
  firstName: string
  lastName: string
  phone: string
  isActive: boolean
  specialization: string
  experience: number
  consultationFee: number
  workingHours: WorkingHours
  createdAt: string
  updatedAt: string
}

export interface WorkingHours {
  start: string
  end: string
  workingDays: number[]
}

export interface PaymentSummary {
  totalRevenue: number;
  totalPending: number;
  totalCount: number;
}
