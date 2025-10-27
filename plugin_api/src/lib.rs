pub trait Plugin: Send + Sync {
    fn name(&self) -> &'static str;

    fn init(&self);

    fn version(&self) -> &'static str {
        "1.0.0"
    }

    fn description(&self) -> &'static str {
        "Plugin sem descrição"
    }

    fn execute(&self) -> Result<String, String> {
        Ok("Plugin executado com sucesso".to_string())
    }
}

#[allow(improper_ctypes_definitions)]
pub type PluginCreate = unsafe extern "C" fn() -> *mut dyn Plugin;

#[allow(improper_ctypes_definitions)]
pub type PluginDestroy = unsafe extern "C" fn(*mut dyn Plugin);


pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result: u64 = add(2, 2);
        assert_eq!(result, 4);
    }
}
