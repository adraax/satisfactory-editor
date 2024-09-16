mod docs;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[cfg(not(debug_assertions))]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[cfg(debug_assertions)]
pub fn run() {
    use std::env::current_dir;
    
    docs::parse_docs().unwrap();

    let path = current_dir().unwrap();
    println!("currentdir {}", path.to_str().unwrap());

    // tauri::Builder::default()
    //     //.plugin(tauri_plugin_devtools::init())
    //     //.plugin(tauri_plugin_devtools_app::init())
    //     .plugin(tauri_plugin_shell::init())
    //     .invoke_handler(tauri::generate_handler![greet])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
}
