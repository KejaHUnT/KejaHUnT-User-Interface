export interface CreateUnitRequest {
    id?: number;
    price: number;
    type: string;
    bathrooms: number;
    size: number;
    floor: number;
    doorNumber: string;
    status: string;
    imageFile?: File;
    imageUrl?: string | null;
    propertyId: number;
    showPrice: boolean;
}