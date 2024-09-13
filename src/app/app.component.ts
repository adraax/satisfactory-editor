import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";
import { Background, Connection, ConnectionSettings, Edge, Node } from "./editor/api";
import { EditorModule } from "./editor/editor.module";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, EditorModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  public connectionSettings: ConnectionSettings = {
    marker: {
      type: "arrow",
    },
  };
  greetingMessage = "";

  //protected background: Background = { type: "grid", backgroundColor: "#191c1c" };
  protected background: Background = { type: "grid", backgroundColor: "#ffffff" };

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
}
