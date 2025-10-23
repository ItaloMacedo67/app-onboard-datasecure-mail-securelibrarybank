use plugin_api:: Plugin;
pub struct OnboardingExemploPlugin;

impl Plugin for OnboardingExemploPlugin {
    fn name(&self) -> &'static str {
        "Onboarding Exemplo v1.0"
    }

    fn version(&self) -> &'static str {
        "1.0.0"
    }

    fn description(&self) -> &'static str {
        "Plugin de exemplo, demonstração e teste do onboarding"
    }    

    fn init(&self) {
        println!("=== Plugin de Onboarding Exemplo Inicializado ===");
        println!("* Verificando configurações iniciais...");
        println!("* Carregando recursos de boas-vindas...");
        println!("* Preparando tour interativo...");
        println!("* Plugin pronto para uso!");
    }
}

#[no_mangle]
pub unsafe extern "C" fn plugin_create() -> *mut dyn Plugin {
    let plugin: OnboardingExemploPlugin = OnboardingExemploPlugin;
    Box::into_raw(Box::new(plugin))
}

#[no_mangle]
pub unsafe extern "C" fn plugin_destroy(ptr: *mut dyn Plugin) {
    if !ptr.is_null() {
        drop(Box::from_raw(ptr));
    }
}
