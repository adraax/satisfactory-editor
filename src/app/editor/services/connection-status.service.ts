import { Injectable, signal } from "@angular/core";
import { ConnectionInternal } from "../interfaces/connection.internal.interface";
import { HandleModel } from "../models/handle.model";
import { NodeModel } from "../models/node.model";

export interface ConnectionStatusIdle {
  state: "idle";
  payload: null;
}

export interface ConnectionStatusStart {
  state: "connection-start";
  payload: Omit<ConnectionInternal, "target" | "targetHandle">;
}

export interface ConnectionStatusValidation {
  state: "connection-validation";
  payload: ConnectionInternal & {
    valid: boolean;
  };
}

export interface ConnectionStatusEnd {
  state: "connection-end";
  payload: ConnectionInternal;
}

export type ConnectionStatus =
  | ConnectionStatusIdle
  | ConnectionStatusStart
  | ConnectionStatusValidation
  | ConnectionStatusEnd;

@Injectable()
export class ConnectionStatusService {
  public readonly status = signal<ConnectionStatus>({ state: "idle", payload: null });

  public setIdleStatus() {
    this.status.set({ state: "idle", payload: null });
  }

  public setConnectionStatusStart(source: NodeModel, sourceHandle: HandleModel) {
    this.status.set({ state: "connection-start", payload: { source, sourceHandle } });
  }

  public setConnectionStatusValidation(
    valid: boolean,
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel
  ) {
    this.status.set({ state: "connection-validation", payload: { source, target, sourceHandle, targetHandle, valid } });
  }

  public setConnectionStatusEnd(
    source: NodeModel,
    target: NodeModel,
    sourceHandle: HandleModel,
    targetHandle: HandleModel
  ) {
    this.status.set({ state: "connection-end", payload: { source, target, sourceHandle, targetHandle } });
  }
}

export function batchStatusChanges(...changes: Function[]) {
  if (changes.length) {
    const [firstChange, ...restChanges] = changes;
    // first change in sync
    firstChange();
    // use timer, or signal only get latest value
    restChanges.forEach((change) => setTimeout(() => change()));
  }
}
