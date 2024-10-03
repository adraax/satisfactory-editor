import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Router } from "@angular/router";
import { check } from "@tauri-apps/plugin-updater";

type state = "loading" | "downloading";

@Component({
  selector: "update",
  templateUrl: "./update.component.html",
  styleUrl: "./update.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule, MatProgressBarModule],
})
export class UpdateComponent implements OnInit {
  private cf = inject(ChangeDetectorRef);

  public state: WritableSignal<state> = signal("loading");
  public dowload = signal(0);

  private router = inject(Router);

  async ngOnInit() {
    try {
      let res = await check();
      if (res) {
        this.state.set("downloading");
        let downloaded = 0;
        let contentLength = 0;

        await res.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              contentLength = event.data.contentLength!;
              break;

            case "Progress":
              downloaded += event.data.chunkLength;
              this.dowload.set((downloaded / contentLength) * 100);
              break;
          }
        });
      }
    } catch (e) {
    } finally {
      this.router.navigateByUrl("main");
    }
  }
}
