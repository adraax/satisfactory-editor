import { computed, inject, Injectable } from "@angular/core";
import { NodeModel } from "../models/node.model";
import { EntitiesService } from "./entities.service";

@Injectable()
export class NodeRenderingService {
  private entitiesService = inject(EntitiesService);

  public readonly nodes = computed(() => {
    return this.entitiesService.nodes().sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder());
  });

  private maxOrder = computed(() => {
    return Math.max(...this.entitiesService.nodes().map((n) => n.renderOrder()));
  });

  public pullNode(node: NodeModel) {
    // TODO do not pull when the node is already on top
    // pull node
    node.renderOrder.set(this.maxOrder() + 1);
    // pull children
    this.entitiesService
      .nodes()
      .filter((n) => n.parent() === node)
      .forEach((n) => this.pullNode(n));
  }
}
