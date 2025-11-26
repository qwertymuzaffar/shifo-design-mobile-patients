export interface AnalyticsResponse {
  totalPatients: TotalPatients
  totalActiveDoctors: number
  totalAppointments: TotalAppointments
  totalRevenue: TotalRevenue
  appointmentStatuses: AppointmentStatuses
  appointmentTypes: AppointmentTypes
  statistics?: Statistic[]
  doctorRatings: DoctorRating[]
  paymentMethods: PaymentMethod[]
}

export interface TotalPatients {
  total: number
  growth: string
}

export interface TotalAppointments {
  total: number
  growth: string
}

export interface TotalRevenue {
  total: number
  growth: string
}

export interface AppointmentStatuses {
  planned: number
  completed: number
  cancelled: number
}

export interface AppointmentTypes {
  consultation: number
  procedure: number
}

export interface DoctorRating {
  name: string
  specialization: { id: number; name: string }
  appointments: number
  cancellations: number
  efficiency: string
  revenue: number
  completed: number
}

export interface PaymentMethod {
  type: string
  count: number
  amount: number
}

export type Statistic = WeekStat | MonthStat | YearStat;

export interface WeekStat {
  day: number
  appointments: number
  revenue: number
}

export interface MonthStat {
  week: number
  appointments: number
  revenue: number
}

export interface YearStat {
  month: number
  appointments: number
  revenue: number
}
