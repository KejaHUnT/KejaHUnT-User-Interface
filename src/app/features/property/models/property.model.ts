import { GeneralFeatures } from "./general-feature.model";
import { IndoorFeature } from "./indoor-feature.model";
import { outdoorFeature } from "./outdoor-feature.model";
import { Unit } from "./unit.model";
import { UpdatePolicyDescription } from "./update-policy-description.model";

export interface Property {
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