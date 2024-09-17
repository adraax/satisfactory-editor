// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    {
        use satisfactory_extractor::parse_docs;
        use std::path::PathBuf;

        let root_path = PathBuf::from(std::env::var("CARGO_WORKSPACE_DIR").unwrap());

        let input_path = root_path.join("src-tauri").join("assets").join("Docs.json");
        let output_path = root_path
            .join("src")
            .join("assets")
            .join("data.json");

        parse_docs(input_path, output_path).unwrap();
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
