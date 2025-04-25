import { Unit } from "./unit.model";

export interface UpdatePropertyRequest {
    name: string;
    location: string;
    type: string;
    units: Unit[];
}