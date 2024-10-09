import { Injectable } from "@angular/core";

import data from "../../assets/data.json";
import { Building } from "../interfaces/building.interface";
import { Item } from "../interfaces/item.interface";
import { Recipe } from "../interfaces/recipe.interface";

@Injectable({ providedIn: "root" })
export class DataService {
  public buildings: Building[] = [];
  public recipes: Recipe[] = [];

  public icons: Map<string, string> = new Map();

  constructor() {
    this.buildings = data.buildings as Building[];
    this.recipes = data.recipes as Recipe[];

    for (let i of data.items as Item[]) {
      this.icons.set(i.name, i.icon);
    }
  }

  public getBgForItem(key: string) {
    return `url('${this.icons.get(key)}')`;
  }

  public getIcon(key: string) {
    return this.icons.get(key);
  }
}
