import { Unit } from "../../property/models/unit.model";

export interface UpdateTenantRequest {
    fullName: string;
    phoneNumber: string;
    idNo: number;
    email: string;
    employer: string;
    units: Unit[];
    updatedAt: Date;
    updatedBy: string;
}