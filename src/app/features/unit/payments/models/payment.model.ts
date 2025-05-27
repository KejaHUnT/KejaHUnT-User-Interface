export interface Payment {
    id?: number; // optional for new payments
    bookingId: number;
    unitId: number;
    doorNumber: string;
  
    // Mpesa Request
    channel: string;
    phoneNumber: string;
    amount: number;
    reference: string;
    mpesaReference?: string;
    narration: string;
    status: string; // should match TransactionStatus enum from backend
  
    createdAt?: Date;
    updatedAt?: Date;
  
    checkoutRequestId: string;
    merchantRequestId: string;
    failedReason?: string;
    isUsed: boolean;
  }
  