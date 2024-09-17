import { Injectable } from "@angular/core";

import data from "../assets/data.json";
import { Building } from "./interfaces/building.interface";
import { Recipe } from "./interfaces/recipe.interface";

@Injectable({ providedIn: "root" })
export class DataService {
  public buildings: Building[] = [];
  public recipes: Recipe[] = [];

  constructor() {
    this.buildings = data.buildings as Building[];
    this.recipes = data.recipes as Recipe[];
  }
}
