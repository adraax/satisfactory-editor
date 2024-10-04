import { ConnectedPosition, Overlay, OverlayModule, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  Signal,
  ViewChild,
} from "@angular/core";
import {
  Background,
  Connection,
  ConnectionCancel,
  ConnectionSettings,
  DynamicNode,
  Edge,
  EditorComponent,
} from "../../editor/api";
import { EditorModule } from "../../editor/editor.module";
import { ItemData } from "../../interfaces/item-data.interface";
import { EntitiesService } from "../../services/entities.service";
import { ContextMenuComponent } from "../context-menu/context-menu.component";
import { ItemComponent } from "../item/item.component";

@Component({
  selector: "main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EditorModule, OverlayModule],
  providers: [EntitiesService],
})
export class MainComponent implements AfterViewInit {
  private overlay = inject(Overlay);
  private entitiesService = inject(EntitiesService);

  private overlayRef!: OverlayRef;
  private portal!: ComponentPortal<ContextMenuComponent>;
  private contextMenuInstance?: ContextMenuComponent;

  private lastRightClick = { x: 0, y: 0 };

  @ViewChild("anchor")
  public anchorRef!: ElementRef;

  @ViewChild(EditorComponent)
  public editor!: EditorComponent;

  public connectionSettings: ConnectionSettings = {
    marker: {
      type: "arrow",
    },
    validator(connection) {
      return connection.sourceHandle === connection.targetHandle;
    },
  };
  greetingMessage = "";

  protected background: Background = { type: "grid", backgroundColor: "#32323a", color: "#707070" };

  public nodes: Signal<DynamicNode[]> = computed(() => this.entitiesService.nodes());

  public edges: Signal<Edge[]> = computed(() => this.entitiesService.edges());

  public createEdge({ source, target, sourceHandle, targetHandle }: Connection) {
    this.entitiesService.edges.set([
      ...this.edges(),
      {
        id: `${source} -> ${target}${sourceHandle ?? ""}${targetHandle ?? ""}`,
        source,
        target,
        sourceHandle,
        targetHandle,
        markers: {
          end: { type: "arrow" },
        },
        type: "template",
      },
    ]);
  }

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.anchorRef)
        .withPositions([
          { originX: "start", originY: "bottom", overlayX: "start", overlayY: "top" } as ConnectedPosition,
          { originX: "start", originY: "top", overlayX: "start", overlayY: "bottom" } as ConnectedPosition,
          { originX: "end", originY: "bottom", overlayX: "end", overlayY: "top" } as ConnectedPosition,
          { originX: "end", originY: "top", overlayX: "end", overlayY: "bottom" } as ConnectedPosition,
        ]),
      hasBackdrop: true,
      backdropClass: "cdk-overlay-transparent-backdrop",
    });

    this.portal = new ComponentPortal(ContextMenuComponent);

    this.overlayRef._outsidePointerEvents.subscribe((e) => {
      if (e.button === 2) {
        this.rightClick(e);
      } else {
        if (this.overlayRef.hasAttached()) {
          this.resetOverlay();
        }
      }
    });
  }

  public rightClick(event: MouseEvent) {
    event.preventDefault();
    this.lastRightClick = { x: event.x, y: event.y };

    this.anchorRef.nativeElement.style.left = event.x + "px";
    this.anchorRef.nativeElement.style.top = event.y + "px";

    if (this.overlayRef.hasAttached()) {
      this.overlayRef.updatePosition();
    } else {
      this.contextMenuInstance = this.overlayRef.attach(this.portal).instance;
      this.contextMenuInstance.click.subscribe((e: string) => {
        this.addNode(e);
        this.cd.detectChanges();
      });
    }
  }

  public addNode(text: string): string {
    let id = crypto.randomUUID();

    this.entitiesService.nodes.set([
      ...this.nodes(),
      {
        id,
        type: ItemComponent,
        data: signal({
          name: text,
          constructed: false,
        } satisfies ItemData),
        point: signal(this.editor.documentPointToEditorPoint(this.lastRightClick)),
      },
    ]);

    this.resetOverlay();

    return id;
  }

  private resetOverlay() {
    if (this.contextMenuInstance) {
      this.contextMenuInstance.setFilter();
    }
    this.overlayRef.detach();
  }

  public triggerOverlay(event: ConnectionCancel) {
    event.event.stopPropagation();
    event.event.preventDefault();
    this.lastRightClick = { x: event.event.x, y: event.event.y };

    this.anchorRef.nativeElement.style.left = event.event.x + "px";
    this.anchorRef.nativeElement.style.top = event.event.y + "px";

    if (this.overlayRef.hasAttached()) {
      this.overlayRef.updatePosition();
    } else if (event.sourceHandle !== undefined) {
      this.contextMenuInstance = this.overlayRef.attach(this.portal).instance;
      this.contextMenuInstance.setFilter({
        name: event.sourceHandle,
        direction: event.type === "source" ? "inputs" : "outputs",
      });
      this.cd.detectChanges();
      this.contextMenuInstance.click.subscribe((e: string) => {
        let node = this.addNode(e);

        let source;
        let target;

        if (event.type === "source") {
          source = event.source;
          target = node;
        } else {
          source = node;
          target = event.source;
        }

        this.createEdge({
          source: source,
          sourceHandle: event.sourceHandle,
          target: target,
          targetHandle: event.sourceHandle,
        });
        this.cd.detectChanges();
      });
    }
  }

  public deleteEdge(edge: Edge) {
    this.entitiesService.deleteEdge(edge.id);
  }
  public dagreRender() {
    this.editor.nodes;
  }
}
