#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    'parse: {
        use satisfactory_extractor::parse_docs;
        use std::path::PathBuf;

        let workspace_dir = std::env::var("CARGO_WORKSPACE_DIR");

        if let Ok(s) = workspace_dir {
            let root_path = PathBuf::from(s);
            let input_path: PathBuf = match std::env::var("SATISFACTORY_JSON") {
                Ok(s) => {
                    let p = PathBuf::from(s);

                    if p.is_absolute() {
                        p
                    } else {
                        root_path.join("src-tauri").join("assets").join(p)
                    }
                }
                Err(_) => break 'parse,
            };

            let output_path = root_path.join("src").join("assets").join("data.json");

            let satisfactory_path = match std::env::var("SATISFACTORY_EXPORT_DIR") {
                Ok(s) if s.is_empty() => None,
                Ok(s) => Some(PathBuf::from(s)),
                Err(_) => None,
            };

            parse_docs(input_path, output_path, satisfactory_path).unwrap();
        };
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::save_file,
            commands::load_save
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
