import { ConnectedPosition, Overlay, OverlayModule, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from "@angular/core";
import {
  Background,
  Connection,
  ConnectionCancel,
  ConnectionSettings,
  Edge,
  EditorComponent,
  Node,
} from "../../editor/api";
import { EditorModule } from "../../editor/editor.module";
import { ItemData } from "../../interfaces/Item-data.interface";
import { ContextMenuComponent } from "../context-menu/context-menu.component";
import { ItemComponent } from "../item/item.component";

@Component({
  selector: "main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EditorModule, OverlayModule],
})
export class MainComponent implements AfterViewInit {
  private overlay = inject(Overlay);

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

  public nodes: Node[] = [];

  public edges: Edge[] = [];

  public createEdge({ source, target, sourceHandle, targetHandle }: Connection) {
    this.edges = [
      ...this.edges,
      {
        id: `${source} -> ${target}${sourceHandle ?? ""}${targetHandle ?? ""}`,
        source,
        target,
        sourceHandle,
        targetHandle,
        markers: {
          end: { type: "arrow" },
        },
      },
    ];
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
    this.nodes = [
      ...this.nodes,
      {
        id,
        type: ItemComponent,
        data: {
          name: text,
        } satisfies ItemData,
        point: this.editor.documentPointToEditorPoint(this.lastRightClick),
      },
    ];
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
        let target = this.addNode(e);
        this.createEdge({
          target: event.source,
          sourceHandle: event.sourceHandle,
          source: target,
          targetHandle: event.sourceHandle,
        });
        this.cd.detectChanges();
      });
    }
  }

  public dagreRender() {
    this.editor.nodes;
  }
}
