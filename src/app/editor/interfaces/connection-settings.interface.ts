import { ConnectionMode, ConnectionValidatorFn } from "../types/connection.type";
import { Curve, EdgeType } from "./edge.interface";
import { Marker } from "./marker.interface";

export interface ConnectionSettings {
  curve?: Curve;
  type?: EdgeType;
  validator?: ConnectionValidatorFn;
  marker?: Marker;
  mode?: ConnectionMode;
}
