#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(sqlplugin: tauri_plugin_sql::Builder) {
    tauri::Builder::default()
        .plugin(sqlplugin.build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
