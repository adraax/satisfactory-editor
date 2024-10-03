import { ConnectedPosition, Overlay, OverlayModule, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";
import { ContextMenuComponent } from "./components/context-menu/context-menu.component";
import { ItemComponent } from "./components/item/item.component";
import { Background, Connection, ConnectionSettings, Edge, EditorComponent, Node } from "./editor/api";
import { EditorModule } from "./editor/editor.module";
import { ItemData } from "./interfaces/Item-data.interface";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, EditorModule, OverlayModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {

}
