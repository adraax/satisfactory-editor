import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { FitViewOptions } from "../interfaces/fit-view-options.interface";
import { ViewportState, WritableViewport } from "../interfaces/viewport.interface";
import { NodeModel } from "../models/node.model";
import { getNodesBounds } from "../utils/node";
import { getViewportForBound } from "../utils/viewport";
import { EditorSettingsService } from "./editor-settings.service";
import { EntitiesService } from "./entities.service";

@Injectable()
export class ViewportService {
  private editorSettingsService = inject(EditorSettingsService);
  private entitiesService = inject(EntitiesService);

  private static getDefaultViewport(): ViewportState {
    return { zoom: 1, x: 0, y: 0 };
  }

  public readonly writableViewport: WritableSignal<WritableViewport> = signal({
    changeType: "initial",
    state: ViewportService.getDefaultViewport(),
    duration: 0,
  });

  public readonly readableViewport: WritableSignal<ViewportState> = signal(ViewportService.getDefaultViewport());

  public fitView(options: FitViewOptions = { padding: 0.1, duration: 0, nodes: [] }) {
    const nodes = this.getBoundsNodes(options.nodes ?? []);

    const state = getViewportForBound(
      getNodesBounds(nodes),
      this.editorSettingsService.computedEditorWidth(),
      this.editorSettingsService.computedEditorHeight(),
      this.editorSettingsService.minZoom(),
      this.editorSettingsService.maxZoom(),
      options.padding ?? 0.1
    );

    const duration = options.duration ?? 0;

    this.writableViewport.set({ changeType: "absolute", state, duration });
  }

  private getBoundsNodes(nodesIds: string[]) {
    return !nodesIds?.length
      ? // if no options or empty, fith the whole view
        this.entitiesService.nodes()
      : // fit specific nodes
        nodesIds
          .map((nodeId) => this.entitiesService.nodes().find(({ node }) => node.id === nodeId))
          .filter((node): node is NodeModel => !!node);
  }
}
