export interface PendingReservation {
    bookingId: number;
    bookingReference: string;
    unitId: number;
    tenantId: number;
    tenantName: string;
    tenantPhone: string;
    bookingDate: Date;
    status: string;
}