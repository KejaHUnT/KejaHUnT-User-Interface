export interface BookingResponse {
    id: number;
    bookingReference: string;
    unitId: number;
    tenentId: number;
    bookingDate: Date;
    expiryDate: Date;
    status: string;
    notes: string;
  }