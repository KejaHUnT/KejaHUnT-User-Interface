import { CreateUnitRequest } from "./create-unit-request.model";

export interface AddPropertyRequest {
    name: string;
    location: string;
    type: string;
    description: string;
    email: string;
    generalFeatures: number[];
    outdoorFeatures: number[];
    indoorFeatures: number[];
    units: CreateUnitRequest[];
}