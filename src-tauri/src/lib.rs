/// DeltaDevX — Tauri backend (minimal, window management only).
/// All functionality is implemented in the frontend — no Rust commands needed.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running DeltaDevX");
}
