use plugin_api::Plugin;

pub struct MailPlugin;

impl Plugin for MailPlugin {
    fn name(&self) -> &'static str {
        "SecureMail"
    }

    fn version(&self) -> &'static str {
        "1.0.0"
    }
    
    fn description(&self) -> &'static str {
        "Cliente de email"
    }

    fn init(&self) {
        println!("Plugin SecureMail inicializado. Pronto para começar o uso.");
}

    fn execute(&self) -> Result<String, String> {
        Ok("Abrindo a interface do SecureMail...".to_string())
    }
}

#[no_mangle]
#[allow(improper_ctypes_definitions)]
pub unsafe extern "C" fn plugin_create() -> *mut dyn Plugin {
    let boxed: Box<dyn Plugin> = Box::new(MailPlugin);
    Box::into_raw(boxed)
}
