export interface CreateUnitRequest {
    id?: number; // Optional, if exists
    price: number;
    type: string;
    bathrooms: number;
    size: number;
    floor: number;
    doorNumber: string;
    status: string;
    imageFile?: File; // Optional, only if you want to upload an image for the unit
    imageUrl?: string | null;
    propertyId: number; // Optional, only if you want to associate the unit with a property
}