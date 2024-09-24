import { computed, Directive, effect, EventEmitter, inject, Output } from "@angular/core";
import { Connection, ConnectionCancel } from "../interfaces/connection.interface";
import { HandleModel } from "../models/handle.model";
import { batchStatusChanges, ConnectionStatusService } from "../services/connection-status.service";
import { EntitiesService } from "../services/entities.service";
import { adjustDirection } from "../utils/adjust-direction";

@Directive({
  selector: "[connectionController]",
  standalone: true,
})
export class ConnectionControllerDirective {
  private connectionStatusService = inject(ConnectionStatusService);
  private entitiesService = inject(EntitiesService);

  @Output()
  public onConnect = new EventEmitter<Connection>();

  @Output()
  public onConnectCancel = new EventEmitter<ConnectionCancel>();

  protected connectEffect = effect(
    () => {
      const status = this.connectionStatusService.status();

      if (status.state === "connection-end") {
        let source = status.payload.source;
        let target = status.payload.target;
        let sourceHandle = status.payload.sourceHandle;
        let targetHandle = status.payload.targetHandle;

        if (this.isStrictMode()) {
          const adjusted = adjustDirection({
            source: status.payload.source,
            sourceHandle: status.payload.sourceHandle,
            target: status.payload.target,
            targetHandle: status.payload.targetHandle,
          });

          source = adjusted.source;
          sourceHandle = adjusted.sourceHandle;
          target = adjusted.target;
          targetHandle = adjusted.targetHandle;
        }

        const sourceId = source.node.id;
        const targetId = target.node.id;

        const sourceHandleId = sourceHandle.rawHandle.id;
        const targetHandleId = targetHandle.rawHandle.id;

        const connectionModel = this.entitiesService.connection();
        const connection = {
          source: sourceId,
          target: targetId,
          sourceHandle: sourceHandleId,
          targetHandle: targetHandleId,
        };

        if (connectionModel.validator(connection)) {
          this.onConnect.emit(connection);
        }
      } else {
        if (status.state === "connection-cancel") {
          const sourceId = status.payload.source.node.id;
          const sourceHandleId = status.payload.sourceHandle.rawHandle.id;
          const event = status.payload.event;

          const connection = {
            source: sourceId,
            sourceHandle: sourceHandleId,
            event,
          };
          this.onConnectCancel.emit(connection);
        }
      }
    },
    { allowSignalWrites: true }
  );

  protected isStrictMode = computed(() => this.entitiesService.connection().mode === "strict");

  public startConnection(handle: HandleModel) {
    this.connectionStatusService.setConnectionStatusStart(handle.parentNode, handle);
  }

  public validateConnection(handle: HandleModel) {
    const status = this.connectionStatusService.status();

    if (status.state === "connection-start") {
      let source = status.payload.source;
      let target = handle.parentNode;
      let sourceHandle = status.payload.sourceHandle;
      let targetHandle = handle;

      if (this.isStrictMode()) {
        const adjusted = adjustDirection({
          source: status.payload.source,
          sourceHandle: status.payload.sourceHandle,
          target: handle.parentNode,
          targetHandle: handle,
        });

        source = adjusted.source;
        sourceHandle = adjusted.sourceHandle;
        target = adjusted.target;
        targetHandle = adjusted.targetHandle;
      }

      const valid = this.entitiesService.connection().validator({
        source: source.node.id,
        target: target.node.id,
        sourceHandle: sourceHandle.rawHandle.id,
        targetHandle: targetHandle.rawHandle.id,
      });

      handle.state.set(valid ? "valid" : "invalid");

      // status is about how we draw connection, so we don't need swapped diretion here
      this.connectionStatusService.setConnectionStatusValidation(
        valid,
        status.payload.source,
        handle.parentNode,
        status.payload.sourceHandle,
        handle
      );
    }
  }

  public resetValidateConnection(handle: HandleModel) {
    handle.state.set("idle");

    const status = this.connectionStatusService.status();

    if (status.state === "connection-validation") {
      this.connectionStatusService.setConnectionStatusStart(status.payload.source, status.payload.sourceHandle);
    }
  }

  public endConnection(handle: HandleModel) {
    const status = this.connectionStatusService.status();

    if (status.state === "connection-validation") {
      const source = status.payload.source;
      const target = status.payload.target;
      const sourceHandle = status.payload.sourceHandle;
      const targetHandle = status.payload.targetHandle;

      batchStatusChanges(
        () => this.connectionStatusService.setConnectionStatusEnd(source, target, sourceHandle, targetHandle),
        () => this.connectionStatusService.setIdleStatus()
      );
    }
  }
}
