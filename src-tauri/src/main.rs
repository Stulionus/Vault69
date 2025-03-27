// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod server;
use std::thread;

fn main() {
    my_tauri_app_lib::run();

    tauri::Builder::default()
    .setup(|app| {
        let handle = app.handle();
        let boxed_handle = Box::new(handle);

        thread::spawn(move || {
            server::init(*boxed_handle).unwrap();
        });
        Ok(());
    })
    .invoke_handler(tauri::generate_handle![greet])
    .run(tauri::generate_context!())
    .expect("Error running tauri application");
}
