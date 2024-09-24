import { Directive, HostBinding, HostListener, inject } from "@angular/core";
import { ConnectionStatusService } from "../services/connection-status.service";

@Directive({ selector: "svg[rootConnectionContext]" })
export class RootConnectionContextDirective {
  private connectionStatusService = inject(ConnectionStatusService);

  @HostListener("document:mouseup", ["$event"])
  protected resetConnection(event: MouseEvent) {
    const status = this.connectionStatusService.status();

    if (status.state === "connection-start") {
      this.connectionStatusService.setIdleStatus(true, event);
    }
  }
}
