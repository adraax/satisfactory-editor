import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnInit, Output } from "@angular/core";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { DataService } from "../../data.service";
import { Recipe } from "../../interfaces/recipe.interface";

@Component({
  templateUrl: "./context-menu.component.html",
  styleUrl: './context-menu.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatListModule, MatDividerModule],
})
export class ContextMenuComponent implements OnInit {
  @Output()
  public click = new EventEmitter<string>();

  public dataService = inject(DataService);

  public recipes: Recipe[] = [];

  ngOnInit(): void {
    this.recipes = this.dataService.recipes;
  }

  public onClick(e: string) {
    this.click.emit(e);
  }
}
