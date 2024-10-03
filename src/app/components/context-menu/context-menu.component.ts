import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, inject, Output, ViewChild } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { DataService } from "../../data.service";
import { Recipe } from "../../interfaces/recipe.interface";

@Component({
  templateUrl: "./context-menu.component.html",
  styleUrl: "./context-menu.component.css",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
  ],
})
export class ContextMenuComponent {
  @ViewChild("input") input!: ElementRef<HTMLInputElement>;
  public control = new FormControl("");

  @Output()
  public click = new EventEmitter<string>();

  public dataService = inject(DataService);

  public recipes: Recipe[] = [];
  public filteredRecipes: Recipe[] = [];
  public displayRecipes: Recipe[];

  constructor() {
    this.recipes = this.dataService.recipes;
    this.filteredRecipes = this.recipes.slice();
    this.displayRecipes = this.filteredRecipes;
  }

  public filter() {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.displayRecipes = this.filteredRecipes.filter((r) => r.name.toLowerCase().includes(filterValue));
  }

  public setFilter(options?: { name: string; direction: "inputs" | "outputs" }) {
    if (options === undefined) {
      this.filteredRecipes = this.recipes.slice();
    } else {
      if (options.direction === "inputs") {
        this.filteredRecipes = this.recipes.filter((r) => r.inputs.filter((e) => e.name === options.name).length > 0);
      } else {
        this.filteredRecipes = this.recipes.filter((r) => r.outputs.filter((e) => e.name === options.name).length > 0);
      }
    }
  }

  public onClick(e: string) {
    this.click.emit(e);
  }
}
