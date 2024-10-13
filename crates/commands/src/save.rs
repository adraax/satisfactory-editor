use std::{
    fs::{read_to_string, File},
    io::{BufWriter, Write},
};
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn save_file(app_handle: AppHandle, mut file: String, data: String) -> Result<(), String> {
    let app_local_data_dir = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())?;

    file.push_str(".json");
    let file_path = app_local_data_dir.join(file);

    let out_file = File::options()
        .create(true)
        .write(true)
        .append(false)
        .truncate(true)
        .open(file_path)
        .map_err(|e| e.to_string())?;

    let mut writer = BufWriter::new(out_file);
    writer
        .write_all(data.as_bytes())
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn load_save(app_handle: AppHandle, mut file: String) -> Result<String, String> {
    let app_local_data_dir = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())?;

    file.push_str(".json");
    let file_path = app_local_data_dir.join(file);

    let res = read_to_string(file_path).map_err(|e| e.to_string())?;

    Ok(res)
}
