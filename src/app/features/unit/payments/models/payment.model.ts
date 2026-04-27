import { Unit } from "@app/features/property/models/unit.model";
import { PaymentTransactionStatus, UnitPaymentStatus } from "../enums/payment.enum";

export type PaymentGateway = 'paystack' | 'mpesa' | 'flutterwave' | 'stripe';

export interface CreateUnitPaymentsDto {
  unitId: number;
  propertyId: number;
  tenantId: number;

  userEmail: string;
  phoneNumber: string;

  amount: number;
  currency: string;

  periodMonth: number;
  periodYear: number;

  gateway: PaymentGateway;
  accountId: string;
}

// ===============================
// API RESPONSE TYPE (matches backend)
// ===============================
export interface InitializePaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: number;
    reference: string;
    paymentUrl: string;
    status: number;
    gateway: string;
  };
}

export interface UnitPaymentsDto {
  id: number;
  unitId: number;
  propertyId: number;
  tenantId: number;

  periodMonth: number;
  periodYear: number;

  expectedAmount: number;
  paidAmount: number;

  status: UnitPaymentStatus;

  createdAt: string; // ISO date string

  transactions: PaymentTransactionDto[];
}

export interface PaymentTransactionDto {
  id: number;
  externalPaymentId: number;
  amount: number;
  status: PaymentTransactionStatus;
  reference?: string; // optional (nullable in C#)
  createdAt: string; // ISO date string from API
}

export interface UpdateUnitPaymentsDto {
  expectedAmount?: number;
}