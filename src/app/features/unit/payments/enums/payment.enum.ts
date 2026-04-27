export enum UnitPaymentStatus {
  Pending = 0,
  Partial = 1,
  Paid = 2,
  Overpaid = 3,
  Failed = 4,
  Cancelled = 5,
  Refunded = 6,
  Disputed = 7
}

export enum PaymentTransactionStatus {
  Initialized = 0,
  Pending = 1,
  Processing = 2,
  Success = 3,
  Failed = 4,
  Cancelled = 5,
  Timeout = 6,
  Reversed = 7,
  Refunded = 8
}