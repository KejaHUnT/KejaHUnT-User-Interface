import { CreateUnitRequest } from "../../property/models/create-unit-request.model";

export interface AddTenantRequest {
    fullName: string;
    phoneNumber: string;
    idNo: number;
    email: string;
    employer: string;
    unitId: number;
    createdBy: string;
}