export interface UpdateUnitRequest {
    price: number;
    type: string;
    bathrooms: string;
    size: number;
    floor: number;
    doorNumber: number;
    status: number;
    propertyId: number; // Optional, only if you want to associate the unit with a property

}