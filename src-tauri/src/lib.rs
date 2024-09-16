use std::env::current_dir;

use satisfactory_extractor::parse_docs;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    {
        let input_path = current_dir().unwrap().join("assets").join("Docs.json");
        let output_path = current_dir().unwrap().join("..").join("src").join("assets").join("data.json");
        dbg!(input_path.clone());
        dbg!(output_path.clone());
        
        parse_docs(input_path, output_path).unwrap();
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
