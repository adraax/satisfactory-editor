import { Injectable, signal, WritableSignal } from "@angular/core";
import { ItemComponent } from "../components/item/item.component";
import { ComponentDynamicNode, DynamicNode, Edge } from "../editor/api";
import { ItemData } from "../interfaces/item-data.interface";

@Injectable()
export class EntitiesService {
  public nodes: WritableSignal<DynamicNode[]> = signal([]);
  public edges: WritableSignal<Edge[]> = signal([]);

  public deleteEdge(id: string) {
    this.edges.set(this.edges().filter((e) => e.id !== id));
  }

  public deleteNode(id: string) {
    this.edges.set(this.edges().filter((e) => e.source !== id && e.target !== id));
    this.nodes.set(this.nodes().filter((n) => n.id !== id));
  }

  public exportEntities() {
    let nodes = this.nodes().map((n) => {
      let node = n as ComponentDynamicNode<ItemData>;
      return {
        id: node.id,
        data: node.data ? node.data() : null,
        point: {
          x: node.point().x,
          y: node.point().y,
        },
      };
    });

    return {
      nodes,
      edges: this.edges(),
    };
  }

  public hydrate(data: string) {
    let save = JSON.parse(data);

    let nodes: DynamicNode[] = [];

    save.nodes.forEach((node: any) => {
      nodes.push({
        id: node.id,
        type: ItemComponent,
        data: signal({
          ...node.data,
        } satisfies ItemData),
        point: signal({ x: node.point.x, y: node.point.y }),
      } satisfies ComponentDynamicNode<ItemData>);
    });

    this.nodes.set(nodes);
    this.edges.set(save.edges);
  }
}
