import { Routes } from "@angular/router";
import { UpdateComponent } from "./components/update/update.component";

export const routes: Routes = [
  {
    path: "main",
    loadComponent: () => import("./components/main/main.component").then((mod) => mod.MainComponent),
  },
  { path: "", pathMatch: "full", component: UpdateComponent },
];
