let invoke;

const availablePlugins = [
    {
        name: "Onboarding Exemplo v1.0",
        version: "1.0.0",
        description: "Plugin de exemplo, demonstração e teste do onboarding",
        installed: false
    },
    {
        name: "SecureMail",
        version: "1.0.0",
        description: "Cliente de email",
        installed: false
    },
    {
        name: "DataSecure",
        version: "1.0.0",
        description: "Proteção de dados em nuuvem",
        installed: false
    },
    {
        name: "SecureLibraryBanco",
        version: "0.0.1",
        description: "Biblioteca de documentos e arquivos para aprendizado e analise global",
        installed: false
    },
    {
        name: "GeoSecureAlerts",
        version: "0.0.1",
        description: "Serviço de proteção e alertas",
        installed: false
    },
    {
        name: "FreeEbooksSecure",
        version: "0.0.1",
        description: "Biblioteca com ebooks gratuitos sobre segurança, proteção e prevenção",
        installed: false
    }
];

let installedPlugins = [];

async function loadInstalledPlugins() {
    try {
        installedPlugins = await invoke('get_loaded_plugins');
        console.log('Plugins instalados e carregados:', installedPlugins);

        availablePlugins.forEach(plugin => {
            plugin.installed = installedPlugins.some(
                installed => installed.name === plugin.name
            );
        });

        updateUI();
    } catch (error) {
        console.error('Erro ao carregar plugins instalados:', error);
        updateUI();
    }
}

function updateUI() {
    const container = document.getElementById('plugins-container');
    if (!container) return;
    container.innerHTML = '';

    if (availablePlugins.length === 0) {
        container.innerHTML = '<p>Nenhum plugin disponível.</p>';
        return;
    }

    availablePlugins.forEach(plugin => {
        const card = createPluginCard(plugin);
        container.appendChild(card);
    });
}

function createPluginCard(plugin) {
    const item = document.createElement('div');
    item.className = 'plugin-item';

    const statusText = plugin.installed ? 'Instalado' : 'Disponivel';

    item.innerHTML = `
    <img src="icons/32x32.png" class="plugin-icon" alt="Ícone do Plugin"/>
        <div class="plugin-info">
            <h3>${plugin.name}</h3>
            <div class="version">Versão ${plugin.version}</div>
            <p class="description">${plugin.description}</p>
        </div>
        <div class="plugin-status-badge">
            ${statusText}
        </div>
    `;
    return item;
};
//    if (!plugin.installed) {
//        card.addEventListener('click', () => {
//            alert(`Funcionalidade de download será implementada em breve!\n\nPlugin: ${plugin.name}\n\nEm produção aqui baixario o arquivo .so/.dll`);
//        });
//    }
//
//    return card;
//}

function updateInstalledSection() {
    const section = document.getElementById('installed-section');
    const list = document.getElementById('installed-list');

    if (installedPlugins.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    list.innerHTML = '';

    installedPlugins.forEach(plugin => {
        const badge = document.createElement('div');
        badge.className = 'installed-badge';
        badge.textContent = `${plugin.name} v${plugin.version}`;
        list.appendChild(badge);
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    if (window.__TAURI__ && window.__TAURI__.tauri && window.__TAURI__.tauri.invoke) {
        invoke = window.__TAURI__.tauri.invoke;
        await loadInstalledPlugins();
    } else {
        console.error('Tauri não está disponivel.')
        updateUI();
    }
});
