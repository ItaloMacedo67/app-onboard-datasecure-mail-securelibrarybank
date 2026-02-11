use plugin_api::Plugin;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Email {
    id: u32,
    sender: String,
    subject: String,
    body: String,
    date: String,
    read: bool,
}

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
        let emails: Vec<Email> = vec![
            Email {
                id: 1,
                sender: "chefe@empresa.com".to_string(),
                subject: "Reunião de Segunda".to_string(),
                body: "Não se esqueça da reunião às 9h.".to_string(),
                date: "2023-10-27 08:30".to_string(),
                read: false,
            },
            Email {
                id: 2,
                sender: "marketing@loja.com".to_string(),
                subject: "Promoção Imperdível".to_string(),
                body: "Tudo com 50% de desconto!".to_string(),
                date: "2023-10-26 14:00".to_string(),
                read: true,
            },
            Email {
                id: 3,
                sender: "ti@empresa.com".to_string(),
                subject: "Atualização de Segurança".to_string(),
                body: "Por favor, reinicie seu computador para aplicar as atualizações.".to_string(),
                date: "2023-10-25 09:15".to_string(),
                read: true,
            },
        ];

        serde_json::to_string(&emails).map_err(|e| e.to_string())
    }
}

#[no_mangle]
#[allow(improper_ctypes_definitions)]
pub unsafe extern "C" fn plugin_create() -> *mut dyn Plugin {
    let boxed: Box<dyn Plugin> = Box::new(MailPlugin);
    Box::into_raw(boxed)
}
