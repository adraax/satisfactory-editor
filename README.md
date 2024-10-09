# Quick Setup
First install the frontend dependencies.<br>
Then install the [Tauri Cli](https://tauri.app/start/create-project/#manual-setup-tauri-cli), and launch the project using your preferred dependency manager : 
```
npx tauri dev
yarn tauri dev
pnpm tauri dev
cargo tauri dev
```

# Advanced setup
Unfortunatly, TauriCli does not support cargo env (see [this issue](https://github.com/tauri-apps/tauri/issues/8169)).<br>
To use the following features, you need to start tauri and the frontend separately with
`pnpm start` and `cargo run`

## Update the frontend JSON
The frontend JSON is rebuilt with each tauri launch.<br>
You can configure the input file with the `SATISFACTORY_JSON` variable in `.cargo/config.toml`.<br>
It can be an absolute path, or a relative path to `src-tauri/assets/`, and the file must be encoded in UTF-8.
You can find these JSON files in the game folder (`Satisfactory\CommunityResources\Docs`), but they are encoded with UTF16-LE and must be reencoded before use.

## Updating the icons
You can extract these icons from the game files using [FModel](https://github.com/4sval/FModel/releases), and following a guide like [this one](https://docs.ficsit.app/satisfactory-modding/latest/Development/ExtractGameFiles.html).<br>
Please note that the guide is a little outdated and that the UE Version you should use is `GAME_UE5_3`.

To export the icons needed, select the archive `FactoryGame-Windows.utoc`.
Then navigate to `FactoryGame/Content/FactoryGame/Resource`, right click on the folder and select `Save Folder's Packages Textures (.png)`.<br>
Wait until the line `[INF] Successfully saved FactoryGame/Content/FactoryGame/Resource` appear in the console.

You can now set the `SATISFACTORY_EXPORT_DIR` variable in `.cargo/config.toml` with the value `"{{absolute path to the output folder}}\\Exports\\FactoryGame\\Content"`.<br>
The icons will be extracted with each tauri launch.


# Inspirations

[ngx-vflow](https://github.com/artem-mangilev/ngx-vflow) for the node base editor

[Ficsit Companion](https://github.com/adepierre/ficsit-companion) for the features
