export interface Unit {
    id: number; // optional if exists
    price: number;
    type: string;
    bathrooms: number;
    size: number;
    floor: number;
    doorNumber: string;
    status: string;
    propertyId: number; // optional if exists
    documentId: string | null; // optional if exists
}