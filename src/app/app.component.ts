import { ConnectedPosition, Overlay, OverlayModule, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, inject, ViewChild } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";
import { ContextMenuComponent } from "./components/context-menu/context-menu.component";
import { Background, Connection, ConnectionSettings, Edge, EditorComponent, Node } from "./editor/api";
import { EditorModule } from "./editor/editor.module";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, EditorModule, OverlayModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements AfterViewInit {
  private overlay = inject(Overlay);

  private overlayRef!: OverlayRef;

  private lastRightClick = { x: 0, y: 0 };

  @ViewChild("anchor")
  public anchorRef!: ElementRef;

  @ViewChild(EditorComponent)
  public editor!: EditorComponent;

  public connectionSettings: ConnectionSettings = {
    marker: {
      type: "arrow",
    },
  };
  greetingMessage = "";

  protected background: Background = { type: "grid", backgroundColor: "#32323a", color: "#707070" };

  public nodes: Node[] = [
    {
      id: "1",
      point: { x: 10, y: 10 },
      type: "default",
      text: "default",
    },
    {
      id: "2",
      point: { x: 200, y: 200 },
      type: "default",
      text: "default 2",
      draggable: false,
    },
  ];

  public edges: Edge[] = [
    {
      id: "1 -> 2",
      source: "1",
      target: "2",
    },
  ];

  public createEdge({ source, target }: Connection) {
    this.edges = [
      ...this.edges,
      {
        id: `${source} -> ${target}`,
        source,
        target,
      },
    ];
  }

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>("greet", { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

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

    this.overlayRef._outsidePointerEvents.subscribe((e) => {
      if (e.button === 2) {
        this.rightClick(e);
      } else {
        this.overlayRef.detach();
      }
    });
  }

  public rightClick(event: MouseEvent) {
    event.preventDefault();
    this.lastRightClick = { x: event.x, y: event.y };
    const componentPortal = new ComponentPortal(ContextMenuComponent);

    this.anchorRef.nativeElement.style.left = event.x + "px";
    this.anchorRef.nativeElement.style.top = event.y + "px";

    if (this.overlayRef.hasAttached()) {
      this.overlayRef.updatePosition();
    } else {
      this.overlayRef.attach(componentPortal).instance.click.subscribe((e) => this.addNode(e));
    }
  }

  public addNode(text: string) {
    this.nodes = [
      ...this.nodes,
      {
        id: crypto.randomUUID(),
        type: "default",
        text,
        point: this.editor.documentPointToEditorPoint(this.lastRightClick),
      },
    ];
    this.overlayRef.detach();
  }
}
