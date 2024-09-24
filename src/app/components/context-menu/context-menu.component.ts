import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatListModule } from "@angular/material/list";
import { MatInputModule } from "@angular/material/input";
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
    MatInputModule
  ],
})
export class ContextMenuComponent implements OnInit {
  @ViewChild("input") input!: ElementRef<HTMLInputElement>;
  public control = new FormControl("");

  @Output()
  public click = new EventEmitter<string>();

  public dataService = inject(DataService);

  public recipes: Recipe[] = [];
  public filteredRecipes: Recipe[];

  constructor() {
    this.filteredRecipes = this.recipes.slice();
  }

  public filter() {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredRecipes = this.recipes.filter((r) => r.name.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    this.recipes = this.dataService.recipes;
  }

  public onClick(e: string) {
    this.click.emit(e);
  }
}
