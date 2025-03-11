import { computed, effect, inject, Injectable, Signal, signal } from "@angular/core";
import { graphlib, layout, Node } from "@dagrejs/dagre";
import { ComponentDynamicNode, DynamicNode, Edge, Point } from "../editor/api";
import { ItemData } from "../interfaces/item-data.interface";
import { EntitiesService } from "./entities.service";

@Injectable()
export class LayoutService {
  private entitiesService = inject(EntitiesService);

  private nodes: Signal<DynamicNode[]> = computed(() => this.entitiesService.nodes());
  private edges: Signal<Edge[]> = computed(() => this.entitiesService.edges());

  private oldNodes: ComponentDynamicNode<ItemData>[] = [];

  private active = signal(false);

  private graph: graphlib.Graph;

  private config = { rankdir: "LR", ranker: "network-simplex", nodesep: 100, ranksep: 100 };

  constructor() {
    this.graph = new graphlib.Graph({ directed: true, multigraph: true });
    this.graph.setGraph(this.config);

    effect(
      () => {
        if (this.active()) {
          const newNodes = this.nodes() as ComponentDynamicNode<ItemData>[];
          const newNodesIds = newNodes.map((n) => n.id);
          const removed = this.oldNodes.filter((n) => !newNodesIds.includes(n.id));

          // first remove deleted nodes
          removed.forEach((n) => {
            this.graph.removeNode(n.id);
          });

          // then create / update nodes
          newNodes.forEach((n) => {
            this.graph.setNode(n.id, this.nodeToDagreNode(n));
          });

          // update / create edges
          this.edges().forEach((e) => this.graph.setEdge(e.source, e.target, { name: e.id }, e.id));

          // finally layout
          if (newNodes.length > 0) {
            layout(this.graph);

            this.graph.nodes().forEach((v) => {
              this.nodes()
                .find((n) => n.id === v)
                ?.point.set(this.dagreNodeToPoint(this.graph.node(v)));
            });
          }
          this.oldNodes = newNodes;
        }
      },
      { allowSignalWrites: true }
    );
  }

  public setup() {
    this.active.set(true);
  }

  public reset() {
    this.active.set(false);
    this.graph = new graphlib.Graph({ directed: true, multigraph: true });
    this.graph.setGraph({ ...this.config, ranker: "network-simplex" });
  }

  private nodeToDagreNode(node: ComponentDynamicNode<ItemData>) {
    let width = node.data!().width ?? 0;
    let height = node.data!().height ?? 0;
    let name = node.data!().name ?? node.id;

    return { name, width, height };
  }

  private dagreNodeToPoint(node: Node): Point {
    return { x: node.x - node.width / 2, y: node.y - node.height / 2 };
  }
}
