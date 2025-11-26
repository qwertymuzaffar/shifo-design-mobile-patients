import { SpecializationModel } from '@core/models/specialization.model';

export interface DoctorListResponse {
  items: Doctor[]
  total: number
  page: string
  limit: string
  totalPages: number
}

export interface Doctor {
  id: number
  firstName: string
  lastName: string
  phone: string
  isActive: boolean
  specialization: SpecializationModel
  experience: number
  consultationFee: number
  workingHours: WorkingHours,
  username: string,
  email?: string,
  password: string,
  user: {
        id: number,
        username: string,
        email: string,
        phone: string,
        firstName: string,
        lastName: string,
        roleId: number,
        isActive: boolean,
        createdAt: string,
        updatedAt: string,
        fullName: string
  }
}

export type DoctorCreate = Omit<Doctor, 'id' | "user">;

export interface WorkingHours {
  start: string
  end: string
  workingDays: number[]
}
