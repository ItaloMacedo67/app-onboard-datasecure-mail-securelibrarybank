const { invoke } = window.__TAURI__.tauri;

const availablePlugins = [
    {
        name: "SecureMail",
        version: "0.0.1",
        description: "Cliente de email",
        installed: false
    },
    {
        name: "DataSecure",
        version: "0.0.1",
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
    container.innerHTML = '';

    availablePlugins.forEach(plugin => {
        const card = createPluginCard(plugin);
        container.appendChild(card);
    });

    updateInstalledSection();
}

function createPluginCard(plugin) {
    const card = document.createElement('div');
    card.className = `plugin-card ${plugin.installed ? 'installed' : ''}`;

    card.innerHTML = `
        <h3>${plugin.name}</h3>
        <div class="plugin-version">Versão ${plugin.version}</div>
        <p class="plugin-description">${plugin.description}</p>
        <span class="plugin-status ${plugin.installed ? 'status-installed' : 'status-available'}">
            ${plugin.installed ? 'Instalado' : 'Disponível'}
        </span>
    `;

    if (!plugin.installed) {
        card.addEventListener('click', () => {
            alert(`Funcionalidade de download será implementada em breve!\n\nPlugin: ${plugin.name}\n\nEm produção aqui baixario o arquivo .so/.dll`);
        });
    }

    return card;
}

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

window.addEventListener(`DOMContentLoaded`, () => {
    loadInstalledPlugins();
});
