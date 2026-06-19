export interface PendingReservation {
    bookingId: number;
    bookingReference: string;
    unitId: number;
    unitDoorNumber: string;
    tenantId: number;
    tenantName: string;
    tenantPhone: string;
    bookingDate: Date;
    status: string;
}