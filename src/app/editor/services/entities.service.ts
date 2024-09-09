import { computed, Injectable, Signal, signal } from "@angular/core";
import { Entity } from "../interfaces/entity.interface";
import { EdgeModel } from "../models/edge.model";
import { NodeModel } from "../models/node.model";

@Injectable()
export class EntitiesService {
  public readonly nodes = signal<NodeModel[]>([], {
    equal: (a, b) => (!a.length && !b.length ? true : a === b),
  });

  public readonly edges = signal<EdgeModel[]>([], {
    equal: (a, b) => (!a.length && !b.length ? true : a === b),
  });

  public readonly validEdges = computed(() => {
    const nodes = this.nodes();

    return this.edges().filter((e) => nodes.includes(e.source()!) && nodes.includes(e.target()!));
  });

  public entities: Signal<Entity[]> = computed(() => [...this.nodes(), ...this.edges()]);

  public getNode<T>(id: string) {
    return this.nodes().find(({ node }) => node.id === id) as NodeModel<T> | undefined;
  }

  public getDeatchedEdges() {
    return this.edges().filter((e) => e.detached());
  }
}
