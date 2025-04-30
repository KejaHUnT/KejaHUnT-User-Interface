export interface CreateUnitRequest {
    price: number;
    type: string;
    bathrooms: number;
    size: number;
    floor: number;
    doorNumber: string;
    status: string;
    imageFile?: File; // Optional, only if you want to upload an image for the unit
    propertyId: number; // Optional, only if you want to associate the unit with a property
}