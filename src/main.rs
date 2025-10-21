#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use libloading::{Library, Symbol};
use plugin_api::{Plugin, PluginCreate};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

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
        let lib_path = std::path::env::current_dir().unwrap().join(path);
        let lib = Library::new(&lib_path)
            .map_err(|e| format!("Não foi possivel carregar o conteudo: {}", lib_path, e))?;
    
        self.loaded_libraries.push(lib);
        let lib = self.loaded_libraries.last().unwrap();
    
        let constructor: Symbol<PluginCreate> = lib
            .get(b"plugin_create")
            .map_err(|e| format!("Não foi possivel encontrar o 'plugin_create': {}", e))?;
    
        let plugin_ptr = constructor();
        let plugin = Box::from_raw(plugin_ptr);
    
        println!("Plugin '{}' carregado.", plugin.name());
        plugin.init();
    
        self.plugins.push(plugin);
    
        Ok(())
    }

    fn get_plugin_infos(&self) -> Vec<PluginInfo> {
        self.plugins
            .iter()
            .map(|p| PluginInfo {
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
 
fn main() {
    let mut manager = PluginManager::new();

    #[cfg(debug_assertions)]
    {
        let plugins_to_load = [
            "target/debug/libmeu_plugin_exemplo.so",
            "target/debug/libplugin_mail.so",
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
        .manage(Mutex::new(manager))
        .invoke_handler(tauri::generate_handler![get_loaded_plugins])
        .run(tauri::generate_context!())
        .expect("erro ao executar o tauri");
}
