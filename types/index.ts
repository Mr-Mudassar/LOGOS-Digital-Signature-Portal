// Type definitions for the application

import { Contract, User, Signature, ContractStatus, SignatureType } from '@prisma/client'

// Extended types with relations
export type ContractWithRelations = Contract & {
  initiator: Pick<User, 'id' | 'email' | 'name'>
  receiver?: Pick<User, 'id' | 'email' | 'name'> | null
  signatures: (Signature & {
    user: Pick<User, 'id' | 'email' | 'name'>
  })[]
}

export type UserWithContracts = User & {
  contractsInitiated: Contract[]
  contractsReceived: Contract[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ContractsResponse {
  contracts: ContractWithRelations[]
}

export interface ContractResponse {
  contract: ContractWithRelations
}

// Form types
export interface SignupFormData {
  name?: string
  email: string
  password: string
  confirmPassword: string
}

export interface SigninFormData {
  email: string
  password: string
}

export interface CreateContractFormData {
  title: string
  initiatorEmail?: string
  receiverEmail: string
  userContext?: string
  referenceDocumentUrl?: string
  referenceDocumentName?: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  token: string
  password: string
  confirmPassword: string
}

// Component Props types
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface ContractCardProps {
  contract: ContractWithRelations
  onUpdate?: () => void
}

export interface StatsCardProps {
  title: string
  value: number
  change?: string
  subtitle?: string
  variant: 'warning' | 'success' | 'info' | 'danger'
}

// Utility types
export type ContractStatusType = ContractStatus
export type SignatureTypeEnum = SignatureType

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface FilterParams {
  status?: ContractStatusType
  search?: string
}
