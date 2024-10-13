import { inject, Injectable, OnDestroy } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { EntitiesService } from "./entities.service";

@Injectable()
export class SaveService implements OnDestroy {
  private entitiesService = inject(EntitiesService);
  private currentFile = "default";

  private interval;

  constructor() {
    this.loadState()
    this.interval = setInterval(() => this.saveState(), 10000);
  }

  ngOnDestroy(): void {
    this.saveState();
    clearInterval(this.interval);
    this.interval = 0;
  }

  public saveState() {
    let state = JSON.stringify(this.entitiesService.exportEntities());
    invoke("save_file", { file: this.currentFile, data: state });
  }

  public async loadState() {
    let res = await invoke<string>("load_save", { file: this.currentFile });
    this.entitiesService.hydrate(res);
  }
}
