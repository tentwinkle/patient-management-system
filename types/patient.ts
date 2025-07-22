export interface Patient {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dob: Date
  createdAt: Date
  updatedAt: Date
}

export interface PatientFormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dob: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy: "firstName" | "lastName" | "email" | "phoneNumber" | "dob" | "createdAt"
  sortOrder: "asc" | "desc"
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PatientListResponse {
  patients: Patient[]
  pagination: PaginationResult
}
