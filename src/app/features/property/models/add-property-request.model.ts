import { CreateUnitRequest } from "./create-unit-request.model";

export interface AddPropertyRequest {
    name: string;
    location: string;
    type: string;
    units: CreateUnitRequest[];
}