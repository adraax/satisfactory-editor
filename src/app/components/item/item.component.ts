import { Component, inject, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { DataService } from "../../data.service";
import { CustomNodeComponent, EditorModule } from "../../editor/api";
import { ItemData } from "../../interfaces/Item-data.interface";
import { Recipe } from "../../interfaces/recipe.interface";

@Component({
  templateUrl: "./item.component.html",
  styleUrl: "./item.component.scss",
  standalone: true,
  imports: [EditorModule, MatCardModule, MatDividerModule],
})
export class ItemComponent extends CustomNodeComponent<ItemData> implements OnInit {
  private dataService = inject(DataService);

  public recipe!: Recipe;

  override ngOnInit(): void {
    super.ngOnInit();
    console.log(this.data()?.name);
    this.recipe = this.dataService.recipes.find((el) => el.name === this.data()?.name)!;
  }
}
