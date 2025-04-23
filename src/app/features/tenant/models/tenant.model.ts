import { Unit } from "../../property/models/unit.model";

export interface Tenant {
    id: number;
    fullName: string;
    phoneNumber: string;
    idNo: number;
    email: string;
    employer: string;
    units: Unit[];
}