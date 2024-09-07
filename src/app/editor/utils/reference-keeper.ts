import { DynamicNode, Node } from "../interfaces/node.interface";
import { NodeModel } from "../models/node.model";

export class ReferenceKeeper {
  public static nodes(newNodes: Node[] | DynamicNode[], oldNodeModels: NodeModel[]) {
    const oldNodesMap: Map<Node | DynamicNode, NodeModel> = new Map();
    oldNodeModels.forEach((model) => oldNodesMap.set(model.node, model));

    return newNodes.map(newNode => {
      if (oldNodesMap.has(newNode)) return oldNodesMap.get(newNode)!;
      else return new NodeModel(newNode);
    });
  }
}
