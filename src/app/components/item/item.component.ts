import { Component, HostListener, inject, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { DataService } from "../../data.service";
import { CustomDynamicNodeComponent, EditorModule } from "../../editor/api";
import { ItemData } from "../../interfaces/item-data.interface";
import { Recipe } from "../../interfaces/recipe.interface";
import { EntitiesService } from "../../services/entities.service";

@Component({
  templateUrl: "./item.component.html",
  styleUrl: "./item.component.scss",
  standalone: true,
  imports: [EditorModule, MatCardModule, MatDividerModule, MatInputModule, MatFormFieldModule, MatCheckboxModule],
})
export class ItemComponent extends CustomDynamicNodeComponent<ItemData> implements OnInit {
  private dataService = inject(DataService);
  private entitiesService = inject(EntitiesService);

  public constructedCheckChange(event: MatCheckboxChange) {
    this.data.set({
      ...this.data(),
      constructed: event.checked,
    } as ItemData);
  }

  public recipe!: Recipe;

  override ngOnInit(): void {
    super.ngOnInit();
    this.recipe = this.dataService.recipes.find((el) => el.name === this.data()?.name)!;
  }

  @HostListener("window:keydown.delete")
  @HostListener("window:keydown.backspace")
  public deleteNode() {
    if (this.selected()) {
      this.entitiesService.deleteNode(this.node.id);
    }
  }
}
