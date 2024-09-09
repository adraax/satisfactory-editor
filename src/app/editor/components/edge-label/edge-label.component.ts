import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Point } from "../../interfaces/point.interface";
import { EdgeLabelModel } from "../../models/edge-label.model";
import { EdgeModel } from "../../models/edge.model";

@Component({
  selector: "g[edgeLabel]",
  templateUrl: "./edge-label.component.html",
  styles: [
    `
      .edge-label-wrapper {
        width: max-content;

        /*
        this is a fix for bug in chrome, for some reason if the div fully matches the size
        of foreignObject there are occurs some visual artifacts around this div
       */
        margin-top: 1px;
        margin-left: 1px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EdgeLabelComponent implements AfterViewInit {
  @Input()
  public model!: EdgeLabelModel;

  @Input()
  public edgeModel!: EdgeModel;

  @Input()
  public set point(point: Point) {
    this.model.point = point;
  }

  @Input()
  public htmlTemplate?: TemplateRef<any>;

  @ViewChild("edgeLabelWrapper")
  public edgeLabelWrapperRef!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    // this is a fix for visual artifact in chrome that for some reason adresses only for edge label.
    // the bug reproduces if edgeLabelWrapperRef size fully matched the size of parent foreignObject
    const MAGIC_VALUE_TO_FIX_GLITCH_IN_CHROME = 2;

    const width = this.edgeLabelWrapperRef.nativeElement.clientWidth + MAGIC_VALUE_TO_FIX_GLITCH_IN_CHROME;
    const height = this.edgeLabelWrapperRef.nativeElement.clientHeight + MAGIC_VALUE_TO_FIX_GLITCH_IN_CHROME;

    this.model.size.set({ width, height });
  }

  protected getLabelContext() {
    return {
      $implicit: {
        edge: this.edgeModel.edge,
        label: this.model.edgeLabel,
      },
    };
  }
}
