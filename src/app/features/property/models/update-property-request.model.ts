import { CreateUnitRequest } from "./create-unit-request.model";
import { Unit } from "./unit.model";
import { UpdatePolicyDescription } from "./update-policy-description.model";

export interface UpdatePropertyRequest {
    id: number;
    name: string;
    location: string;
    type: string;
    documentId: string;
    description: string;
    email: string;
    generalFeatures: number[];
    outDoorFeatures: number[];
    indoorFeatures: number[];
    units: CreateUnitRequest[];
    policyDescriptions: UpdatePolicyDescription[];
    unitImageFiles?: { [index: number]: File }; // Optional, if you want to upload images for the units
}