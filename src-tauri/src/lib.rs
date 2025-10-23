use libloading::{Library, Symbol};
use plugin_api::{Plugin, PluginCreate};
use serde::{Deserialize, Serialize};
use std::env;
use std::sync::Mutex;
use tauri::State;
use tauri_plugin_log::{Target, TargetKind};


#[derive(Debug, Serialize, Deserialize, Clone)]
struct PluginInfo {
    name: String,
    version: String,
    description: String,
}

struct PluginManager {
    plugins: Vec<Box<dyn Plugin>>,
    loaded_libraries: Vec<Library>,
}

impl PluginManager {
    fn new() -> Self {
        PluginManager {
            plugins: Vec::new(),
            loaded_libraries: Vec::new(),
        }
    }
    
    unsafe fn load_plugin(&mut self, path: &str) -> Result<(), String> {
        let manifest_dir: &'static str = env!("CARGO_MANIFEST_DIR");
        let lib_path: std::path::PathBuf = std::path::Path::new(manifest_dir).join(path);
        
        let lib: Library = Library::new(&lib_path)
            .map_err(|e: libloading::Error| format!("Não foi possivel carregar o conteudo: {:?}: {}", lib_path, e))?;
    
        self.loaded_libraries.push(lib);
        let lib: &Library = self.loaded_libraries.last().unwrap();

        let constructor: Symbol<PluginCreate> = lib
            .get(b"plugin_create")
            .map_err(|e: libloading::Error| format!("Não foi possivel encontrar o 'plugin_create': {}", e))?;
    
        let plugin_ptr: *mut dyn Plugin = constructor();
        let plugin: Box<dyn Plugin> = Box::from_raw(plugin_ptr);
    
        println!("Plugin '{}' carregado.", plugin.name());
        plugin.init();
    
        self.plugins.push(plugin);
    
        Ok(())
    }

    fn get_plugin_infos(&self) -> Vec<PluginInfo> {
        self.plugins
            .iter()
            .map(|p: &Box<dyn Plugin>| PluginInfo {
                name: p.name().to_string(),
                version: p.version().to_string(),
                description: p.description().to_string(),
            })
            .collect()
    }
}

#[tauri::command]
fn get_loaded_plugins(manager: State<Mutex<PluginManager>>) -> Vec<PluginInfo> {
    manager.lock().unwrap().get_plugin_infos()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut manager: PluginManager = PluginManager::new();

    #[cfg(debug_assertions)]
    {
        let plugins_to_load: [&'static str; 2] = [
            "../target/debug/libmeu_plugin_exemplo.so",
            "../target/debug/libplugin_mail.so",
        ];
        for path in plugins_to_load {
            match unsafe { manager.load_plugin(path) } {
                Ok(_) => println!("Plugin de '{}' carregado com sucesso.", path),
                Err(e) => eprintln!("Erro ao carregar o plugin '{}': {}", path, e),
            }
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::new().targets([
            Target::new(TargetKind::LogDir { file_name: None }),
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::Webview),
        ]).build())
        .manage(Mutex::new(manager))
        .invoke_handler(tauri::generate_handler![get_loaded_plugins])
        .run(tauri::generate_context!())
        .expect("erro ao executar o tauri");
        
  //tauri::Builder::default()
  //  .setup(|app| {
  //    if cfg!(debug_assertions) {
  //      app.handle().plugin(
  //        tauri_plugin_log::Builder::default()
  //          .level(log::LevelFilter::Info)
  //          .build(),
  //      )?;
  //    }
  //    Ok(())
  //  })
  //  .run(tauri::generate_context!())
  //  .expect("error while running tauri application");
}
