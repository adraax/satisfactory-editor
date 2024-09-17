import { Part } from "./part.interface";

export interface Recipe {
  name: string;
  alternate: boolean;
  time: number;
  building: string;
  inputs: Part[];
  outputs: Part[];
}
