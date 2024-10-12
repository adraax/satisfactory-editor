import { Component, computed, HostListener, inject, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CustomDynamicNodeComponent, EditorModule } from "../../editor/api";
import { ItemData } from "../../interfaces/item-data.interface";
import { Recipe } from "../../interfaces/recipe.interface";
import { DataService } from "../../services/data.service";
import { EntitiesService } from "../../services/entities.service";

@Component({
  templateUrl: "./item.component.html",
  styleUrl: "./item.component.scss",
  standalone: true,
  imports: [
    EditorModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatChipsModule,
  ],
})
export class ItemComponent extends CustomDynamicNodeComponent<ItemData> implements OnInit {
  private dataService = inject(DataService);
  private entitiesService = inject(EntitiesService);

  public overclock = computed(() => {
    return this.data() !== undefined ? this.data()!.overclock : 100;
  });

  public constructedCheckChange(event: MatCheckboxChange) {
    this.data.set({
      ...this.data(),
      constructed: event.checked,
    } as ItemData);
  }

  public overclockChange(event: Event) {
    const target = event.target as HTMLInputElement;
    let value = target.valueAsNumber;

    if (value < 1) {
      value = 1;
      target.valueAsNumber = 1;
    } else if (value > 250) {
      value = 250;
      target.valueAsNumber = 250;
    }

    this.data.set({
      ...this.data(),
      overclock: target.valueAsNumber,
    } as ItemData);
  }

  public recipe!: Recipe;

  override ngOnInit(): void {
    super.ngOnInit();
    this.recipe = this.dataService.recipes.find((el) => el.name === this.data()?.name)!;
  }

  @HostListener("window:keydown.delete", ["$event"])
  @HostListener("window:keydown.backspace", ["$event"])
  public deleteNode(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement) {
      return;
    }
    if (this.selected()) {
      this.entitiesService.deleteNode(this.node.id);
    }
  }

  public getBgIcon(key?: string) {
    return key ? this.dataService.getBgForItem(key) : "";
  }

  public getIcon(key: string) {}
}
