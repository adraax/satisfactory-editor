import { ChangeDetectionStrategy, Component, EventEmitter, inject, OnInit, Output } from "@angular/core";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { DataService } from "../../data.service";
import { Building } from "../../interfaces/building.interface";

@Component({
  templateUrl: "./context-menu.component.html",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatListModule, MatDividerModule],
})
export class ContextMenuComponent implements OnInit {
  @Output()
  public click = new EventEmitter<string>()
    
  public dataService = inject(DataService);

  public buildings: Building[] = [];

  ngOnInit(): void {
    this.buildings = this.dataService.buildings;
  }

  public onClick(e: string) {
    this.click.emit(e)
  }
}
