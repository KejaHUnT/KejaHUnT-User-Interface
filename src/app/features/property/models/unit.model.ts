export interface Unit {
    id: number; // optional if exists
    price: number;
    type: string;
    bathrooms: number;
    size: number;
    noOfUnits: number;
    documentId: string | null; // optional if exists
}