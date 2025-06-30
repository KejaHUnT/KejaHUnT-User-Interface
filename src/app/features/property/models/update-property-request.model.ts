import { Unit } from "./unit.model";
import { UpdatePolicyDescription } from "./update-policy-description.model";

export interface UpdatePropertyRequest {
    id: number;
        name: string;
        location: string;
        type: string;
        documentId: string;
        description: string;
        generalFeatures: number[];
        outDoorFeatures: number[];
        indoorFeatures: number[];
        units: Unit[];
        policyDescriptions: UpdatePolicyDescription[];
}