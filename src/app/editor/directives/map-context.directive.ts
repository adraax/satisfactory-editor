import { Directive, effect, ElementRef, inject, OnInit, untracked } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { select } from "d3-selection";
import { D3ZoomEvent, zoom, ZoomBehavior, zoomIdentity, zoomTransform, ZoomTransform } from "d3-zoom";
import { ViewportState } from "../interfaces/viewport.interface";
import { EditorSettingsService } from "../services/editor-settings.service";
import { ViewportService } from "../services/viewport.service";
import { RootSvgReferenceDirective } from "./reference.directive";
import { RootPointerDirective } from "./root-pointer.directive";

@Directive({ selector: "g[mapContext]" })
export class MapContextDirective implements OnInit {
  protected rootSvg = inject(RootSvgReferenceDirective).element;
  protected rootPointer = inject(RootPointerDirective);
  protected host = inject<ElementRef<SVGGElement>>(ElementRef).nativeElement;
  protected editorSettingsService = inject(EditorSettingsService);
  protected viewportService = inject(ViewportService);

  protected rootSvgSelection = select(this.rootSvg);
  protected zoomableSelection = select(this.host);

  //protected viewportForSelection: Partial<View>

  protected zoomBehavior!: ZoomBehavior<SVGSVGElement, unknown>;

  public pointer = toSignal(this.rootPointer.mouseMovement$);

  protected translateSvg = effect(
    () => {
      if (this.pointer()! !== undefined) {
        const zoom = untracked(this.viewportService.readableViewport).zoom;
        const transform = zoomTransform(this.rootSvg);

        this.rootSvgSelection.call(
          this.zoomBehavior.transform,
          zoomIdentity
            .translate(this.pointer()!.tX + transform.x, this.pointer()!.tY + transform.y)
            .scale(zoom)
        );
      }
    },
    { allowSignalWrites: true }
  );

  protected manualViewportChangeEffect = effect(
    () => {
      const viewport = this.viewportService.writableViewport();
      const state = viewport.state;

      if (viewport.changeType === "initial") {
        return;
      }

      // zoom
      if (state.zoom !== undefined && state.x === undefined && state.y === undefined) {
        this.rootSvgSelection.transition().duration(viewport.duration).call(this.zoomBehavior.scaleTo, state.zoom);
        return;
      }

      // pan
      if (state.x !== undefined && state.y !== undefined && state.zoom === undefined) {
        const zoom = untracked(this.viewportService.readableViewport).zoom;
        this.rootSvgSelection
          .transition()
          .duration(viewport.duration)
          .call(this.zoomBehavior.transform, zoomIdentity.translate(state.x, state.y).scale(zoom));
        return;
      }

      // full viewport
      if (state.zoom !== undefined && state.x !== undefined && state.y !== undefined) {
        this.rootSvgSelection
          .transition()
          .duration(viewport.duration)
          .call(this.zoomBehavior.transform, zoomIdentity.translate(state.x, state.y).scale(state.zoom));
        return;
      }
    },
    { allowSignalWrites: true }
  );

  public ngOnInit(): void {
    this.zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([this.editorSettingsService.minZoom(), this.editorSettingsService.maxZoom()])
      .on("start", (event: ZoomEvent) => this.onD3ZoomStart(event))
      .on("zoom", (event: ZoomEvent) => this.handleZoom(event))
      .on("end", (event: ZoomEvent) => this.onD3ZoomEnd(event));

    // remove all d3 handler except the mousewheel, optherwise it fucks up mouse events
    this.rootSvgSelection
      .call(this.zoomBehavior)
      .on("dblclick.zoom", null)
      .on("mousedown.zoom", null)
      .on("mousemove.zoom", null)
      .on("touchstart.zoom", null)
      .on("MozMousePixelScroll.zoom", null);
  }

  private handleZoom({ transform }: ZoomEvent) {
    this.viewportService.readableViewport.set(mapTransformToViewportState(transform));

    this.zoomableSelection.attr("transform", transform.toString());

    // TODO update selection
  }
  private onD3ZoomStart({ transform }: ZoomEvent) {
    // TODO update selection
  }
  private onD3ZoomEnd({ transform }: ZoomEvent) {
    // TODO update selection
  }
}

const mapTransformToViewportState = (transform: ZoomTransform): ViewportState => ({
  zoom: transform.k,
  x: transform.x,
  y: transform.y,
});

declare module "d3-selection" {
  interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    transition(): Selection<GElement, Datum, PElement, PDatum>;
    duration(duration: number): Selection<GElement, Datum, PElement, PDatum>;
  }
}

type ZoomEvent = D3ZoomEvent<SVGSVGElement, unknown>;
