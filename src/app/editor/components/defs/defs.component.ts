import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Marker } from "../../interfaces/marker.interface";

@Component({
  selector: "defs[editorDefs]",
  templateUrl: "./defs.component.html",
  styleUrl: "./defs.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefsComponent {
  @Input({ required: true })
  public markers: Map<number, Marker> = new Map();

  protected readonly defaultColor = "rgb(177, 177, 183)";
}
