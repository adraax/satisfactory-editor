import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatProgressBarModule } from "@angular/material/progress-bar";
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
  public state: WritableSignal<state> = signal("loading");
  public dowload = signal(0)

  private router = inject(Router);

  async ngOnInit() {
    let res = await check();
    if (res) {
      let downloaded = 0;
      let contentLength = 0;

      await res.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength!;
            break;
          
          case 'Progress':
            downloaded += event.data.chunkLength;
            this.dowload.set(downloaded / contentLength * 100);
            break;
        }
      });
    } else {
      this.router.navigateByUrl("main");
    }
  }
}
