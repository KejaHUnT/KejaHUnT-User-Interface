import { Unit } from "./unit.model";

export interface UpdatePropertyRequest {
    name: string;
    location: string;
    type: string;
    description: string;
    generalFeatures: number[];
    outdoorFeatures: number[];
    indoorFeatures: number[];
    units: Unit[];
}