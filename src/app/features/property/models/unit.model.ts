export interface Unit {
    price: number;
    type: string;
    bathrooms: number;
    size: number;
    noOfUnits: number;
    documentId: string | null; // optional if exists
}