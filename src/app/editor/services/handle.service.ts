import { Injectable, signal, TemplateRef } from "@angular/core";
import { Microtask } from "../decorators/microtask.decorator";
import { HandleModel } from "../models/handle.model";
import { NodeModel } from "../models/node.model";
import { HandleType } from "../types/handle.type";
import { Position } from "../types/position.type";

export interface NodeHandle {
  position: Position;
  type: HandleType;
  id?: string;
  parentReference?: Element;
  template?: TemplateRef<any>;
}

@Injectable()
export class HandleService {
  public readonly node = signal<NodeModel | null>(null);

  @Microtask
  public createHandle(newHandle: HandleModel) {
    const node = this.node();
    if (node) {
      node.handles.update((handles) => [...handles, newHandle]);
    }
  }

  public destroyHandle(handleToDestroy: HandleModel) {
    const node = this.node();
    if (node) {
      node.handles.update((handles) => handles.filter((handle) => handle !== handleToDestroy));
    }
  }
}
