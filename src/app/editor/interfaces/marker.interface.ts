export type MarkerType = "arrow" | "arrow-closed";
export type MarkerUnitsType = "userSpaceOnUse" | "strokeWidth";

export interface Marker {
  type?: MarkerType;
  width?: number;
  height?: number;
  color?: string;
  orient?: string;
  markerUnits?: MarkerUnitsType;
  strokeWidth?: number;
}
