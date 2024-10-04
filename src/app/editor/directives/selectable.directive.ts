import { Directive, HostListener, inject } from "@angular/core";
import { EdgeComponent } from "../components/edge/edge.component";
import { NodeComponent } from "../components/node/node.component";
import { Entity } from "../interfaces/entity.interface";
import { EntitiesService } from "../services/entities.service";
import { SelectionService } from "../services/selection.service";

@Directive({ selector: "[selectable]" })
export class SelectableDirective {
  private entitiesService = inject(EntitiesService);
  private selectionService = inject(SelectionService);

  private ctrlPressed = false;

  private parentEdge = inject(EdgeComponent, { optional: true });
  private parentNode = inject(NodeComponent, { optional: true });

  @HostListener("mousedown", ["$event"])
  public onMouseDown(event: MouseEvent) {
    const entity = this.entity();

    if (entity) {
      this.selectionService.select(entity, event.ctrlKey);
    }
  }

  @HostListener("window:keydown.escape")
  public resetSelection() {
    this.selectionService.select(null);
  }

  private entity(): Entity | null {
    if (this.parentNode) {
      return this.parentNode.nodeModel;
    } else if (this.parentEdge) {
      return this.parentEdge.model;
    }

    return null;
  }
}
