import { Injectable, signal } from "@angular/core";
import { NodeModel } from "../models/node.model";

@Injectable()
export class EntitiesService {
  public readonly nodes = signal<NodeModel[]>([], {
    equal: (a, b) => (!a.length && !b.length ? true : a === b),
  });

  public getNode<T>(id: string) {
    return this.nodes().find(({ node }) => node.id === id) as NodeModel<T> | undefined;
  }
}
