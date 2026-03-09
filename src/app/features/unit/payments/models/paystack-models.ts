export interface InitializePaymentRequest {
  unitId?: number | null;
  propertyId?: number | null;

  userEmail: string;

  /**
   * Always send amount in MAJOR currency
   * Example: 1500.00
   */
  amount: number;

  currency: string; // Default = KES

  periodMonth: number;
  periodYear: number;

  /**
   * Default = STK_PUSH
   * Future proof for CARD, BANK_TRANSFER etc.
   */
  paymentMethod?: PaymentMethod;
}

export enum PaymentStatus {
  Pending = 0,
  Success = 1,
  Failed = 2
}

export enum PaymentMethod {
  STK_PUSH = "STK_PUSH",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER"
}

export interface InitializePaymentResponse {

  id: number;

  reference: string;

  authorizationUrl: string;

  accessCode: string;

  /**
   * Amount in MAJOR currency.
   * Example: 1500.00
   */
  amount: number;

  currency: string;

  status: PaymentStatus;

  /**
   * ISO Date string from backend.
   * Convert to Date when needed.
   */
  createdAt: string;
}

export interface PaymentResponse {
  id: number;
  unitId?: number;
  propertyId?: number;
  userEmail: string;      // maps from UserEmail in C#
  amount: number;
  currency: string;
  reference: string;
  status: PaymentStatus;  // enum instead of string
  paymentMethod: string;
  periodMonth: number;
  periodYear: number;
  createdAt: string;      // ISO date string from backend
}

export interface MonthlyLedger {
  periodMonth: number;
  periodYear: number;

  expectedRent: number;
  totalPaid: number;

  balance: number;

  status: 'Paid' | 'Partial' | 'Overpaid' | 'Unpaid';

  payments: PaymentResponse[];
}
