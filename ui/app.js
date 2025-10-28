let invoke;
let currentSelectedIndex = 0;

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
    const centralBlock = document.getElementById('central-block');

    if (!container) return;
    container.innerHTML = '';

    if (availablePlugins.length === 0) {
        container.innerHTML = '<p>Nenhum plugin disponível.</p>';
        return;
    }

    availablePlugins.forEach((plugin, index) => {
        const card = createPluginCard(plugin, index);
        container.appendChild(card);
    });

    if (availablePlugins.length > 0) {
        const items = document.querySelectorAll('.plugin-item');
        items[currentSelectedIndex].classList.add('selected');
    }

    requestAnimationFrame(() => {
        const items = document.querySelectorAll('.plugin-item');
        items.forEach(item => {
            item.classList.add('animate');
        });
    });

    const centralBlockDelay = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--central-block-delay')) * 1000;
    const centralBlockDuration = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--central-block-duration')) * 1000;
    const pluginItemDelay = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--plugin-item-delay')) * 1000;
    const pluginItemDuration = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--plugin-item-duration')) * 1000;
    const pluginItemStagger = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue('--plugin-item-stagger')) * 1000;

    const totalAnimationTime = pluginItemDelay +
                                (availablePlugins.length * pluginItemStagger) + 
                                pluginItemDuration + 
                                500;

    setTimeout(() => {
        centralBlock.classList.add('animation-complete');
        document.body.style.overflowY = 'auto';
        document.getElementById('selector').classList.add('visible');
        updateSelectorPosition();
    }, totalAnimationTime);
}

function createPluginCard(plugin, index) {
    const item = document.createElement('div');
    item.className = 'plugin-item';
    item.dataset.index = index;

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

    item.addEventListener('click', () => {
        handleSelection(index, false);
    });

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

function updateSelectorPosition() {
    const selector = document.getElementById('selector');
    const selectedItem = document.querySelector('.plugin-item.selected');
    if (selector && selectedItem) {
        selector.style.top = `${selectedItem.offsetTop}px`;
        selector.style.height = `${selectedItem.offsetHeight}px`;
    }
}

function handleSelection(newIndex, fromKeyboard = false) {
    if (newIndex < 0 || newIndex >= availablePlugins.length) {
        return;
    }

    const items = document.querySelectorAll('.plugin-item');


    const oldSelectedItem = items[currentSelectedIndex];
    if (oldSelectedItem) {
        oldSelectedItem.classList.remove('selected');
    }

    currentSelectedIndex = newIndex;
    const newSelectedItem = items[currentSelectedIndex];
    if (newSelectedItem) {
        newSelectedItem.classList.add('selected');
        if (fromKeyboard) {
            newSelectedItem.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    setTimeout(updateSelectorPosition, 200);
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

window.addEventListener('keydown', (e) => {
    const centralBlock = document.getElementById('central-block');
    if (!centralBlock.classList.contains('animation-complete')) {
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            handleSelection(currentSelectedIndex - 1, true);
            break;
        case 'ArrowDown':
            e.preventDefault();
            handleSelection(currentSelectedIndex + 1, true);
            break;
    }
});
