import { Unit } from "../../property/models/unit.model";

export interface UpdateTenantRequest {
    fullName: string;
    phoneNumber: string;
    idNo: number;
    email: string;
    employer: string;
    unitId: number;
    updatedAt: Date;
    updatedBy: string;
}