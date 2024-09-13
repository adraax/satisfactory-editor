import { computed, Injectable, Signal, signal } from "@angular/core";
import { Entity } from "../interfaces/entity.interface";
import { Marker } from "../interfaces/marker.interface";
import { ConnectionModel } from "../models/connection.model";
import { EdgeModel } from "../models/edge.model";
import { NodeModel } from "../models/node.model";
import { hashCode } from "../utils/hash";

@Injectable()
export class EntitiesService {
  public readonly nodes = signal<NodeModel[]>([], {
    equal: (a, b) => (!a.length && !b.length ? true : a === b),
  });

  public readonly edges = signal<EdgeModel[]>([], {
    equal: (a, b) => (!a.length && !b.length ? true : a === b),
  });

  public readonly connection = signal<ConnectionModel>(new ConnectionModel({}));

  public readonly markers = computed(() => {
    const markersMap = new Map<number, Marker>();

    this.validEdges().forEach((e) => {
      if (e.edge.markers?.start) {
        const hash = hashCode(JSON.stringify(e.edge.markers.start));
        markersMap.set(hash, e.edge.markers.start);
      }

      if (e.edge.markers?.end) {
        const hash = hashCode(JSON.stringify(e.edge.markers.end));
        markersMap.set(hash, e.edge.markers.end);
      }

      const connectionMarker = this.connection().settings.marker;
      if (connectionMarker) {
        const hash = hashCode(JSON.stringify(connectionMarker));
        markersMap.set(hash, connectionMarker);
      }
    });

    return markersMap;
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
