import { Injectable, signal, WritableSignal } from "@angular/core";

import data from "../assets/data.json";
import { Building } from "./interfaces/building.interface";

@Injectable({providedIn: 'root'})
export class DataService {
  public buildings: Building[] = [];

  constructor() {
    this.buildings = data.buildings as Building[];
  }
}
