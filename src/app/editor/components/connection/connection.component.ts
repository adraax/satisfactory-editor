import { ChangeDetectionStrategy, Component, computed, inject, Input, TemplateRef } from "@angular/core";
import { SpacePointContextDirective } from "../../directives/space-point-context.directive";
import { bezierPath } from "../../math/edge-path/bezier-path";
import { straightPath } from "../../math/edge-path/straight-path";
import { ConnectionModel } from "../../models/connection.model";
import { ConnectionStatusService } from "../../services/connection-status.service";
import { Position } from "../../types/position.type";
import { hashCode } from "../../utils/hash";

@Component({
  selector: "g[connection]",
  templateUrl: "./connection.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionComponent {
  private spacePointContext = inject(SpacePointContextDirective);
  private connectionStatusService = inject(ConnectionStatusService);

  @Input({ required: true })
  public model!: ConnectionModel;

  @Input()
  public template?: TemplateRef<any>;

  protected path = computed(() => {
    const status = this.connectionStatusService.status();

    if (status.state === "connection-start") {
      const sourceHandle = status.payload.sourceHandle;
      const sourcePoint = sourceHandle.pointAbsolute();
      const sourcePosition = sourceHandle.rawHandle.position;

      const targetPoint = this.spacePointContext.svgCurrentSpacePoint();
      const targetPosition = getOppositePosition(sourcePosition);

      switch (this.model.curve) {
        case "straight":
          return straightPath(sourcePoint, targetPoint).path;
        case "bezier":
          return bezierPath(sourcePoint, targetPoint, sourcePosition, targetPosition).path;
      }
    }

    if (status.state === "connection-validation") {
      const sourceHandle = status.payload.sourceHandle;
      const sourcePoint = sourceHandle.pointAbsolute();
      const sourcePosition = sourceHandle.rawHandle.position;

      const targetHandle = status.payload.targetHandle;
      const targetPoint = status.payload.valid
        ? targetHandle.pointAbsolute()
        : this.spacePointContext.svgCurrentSpacePoint();
      const targetPosition = status.payload.valid
        ? targetHandle.rawHandle.position
        : getOppositePosition(sourcePosition);

      switch (this.model.curve) {
        case "straight":
          return straightPath(sourcePoint, targetPoint).path;
        case "bezier":
          return bezierPath(sourcePoint, targetPoint, sourcePosition, targetPosition).path;
      }
    }

    return null;
  });

  protected markerUrl = computed(() => {
    const marker = this.model.settings.marker;

    if (marker) {
      return `url(#${hashCode(JSON.stringify(marker))})`;
    }

    return "";
  });

  protected readonly defaultColor = "rgb(177, 177, 183)";

  protected getContext() {
    return {
      $implicit: {
        path: this.path,
        marker: this.markerUrl,
      },
    };
  }
}

function getOppositePosition(position: Position): Position {
  switch (position) {
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    case "left":
      return "right";
    case "right":
      return "left";
  }
}
