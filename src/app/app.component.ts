import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";
import { Node } from "./editor/api";
import { EditorModule } from "./editor/editor.module";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, EditorModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  greetingMessage = "";

  public nodes: Node[] = [
    {
      id: "1",
      point: { x: 10, y: 10 },
      type: 'default',
      text: "default"
    },
  ];

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>("greet", { name }).then((text) => {
      this.greetingMessage = text;
    });
  }
}
