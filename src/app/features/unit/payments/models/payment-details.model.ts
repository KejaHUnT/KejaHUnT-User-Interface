export interface PaymentDetails {
  unitId: number;
  amount: number;
  tenantId: number;
  phoneNumber: string;
  timestamp: Date; // or string if coming as ISO string from the backend
}
