import { Component, HostListener, inject, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { DataService } from "../../data.service";
import { CustomNodeComponent, EditorModule } from "../../editor/api";
import { ItemData } from "../../interfaces/Item-data.interface";
import { Recipe } from "../../interfaces/recipe.interface";
import { EntitiesService } from "../../services/entities.service";

@Component({
  templateUrl: "./item.component.html",
  styleUrl: "./item.component.scss",
  standalone: true,
  imports: [EditorModule, MatCardModule, MatDividerModule, MatInputModule, MatFormFieldModule],
})
export class ItemComponent extends CustomNodeComponent<ItemData> implements OnInit {
  private dataService = inject(DataService);
  private entitiesService = inject(EntitiesService);

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
