import { Injectable, signal, WritableSignal } from "@angular/core";
import { Edge, Node } from "../editor/api";

@Injectable()
export class EntitiesService {
  public nodes: WritableSignal<Node[]> = signal([]);
  public edges: WritableSignal<Edge[]> = signal([]);

  public deleteEdge(id: string) {
    this.edges.set(this.edges().filter((e) => e.id !== id));
  }

  public deleteNode(id: string) {
    this.edges.set(this.edges().filter((e) => e.source !== id && e.target !== id));
    this.nodes.set(this.nodes().filter((n) => n.id !== id));
  }
}
