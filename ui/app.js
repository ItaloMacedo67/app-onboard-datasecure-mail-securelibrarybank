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
    <div class="plugin-icon">
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6f9fa5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#6f9fa5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#6f9fa5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>
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
    if (newIndex < 0 || newIndex >= availablePlugins.length || newIndex === currentSelectedIndex) {
        return;
    }

    const items = document.querySelectorAll('.plugin-item');
    const oldSelectedItem = items[currentSelectedIndex];
    const newSelectedItem = items[newIndex];

    if (oldSelectedItem) {
        oldSelectedItem.classList.add('closing');
        oldSelectedItem.classList.remove('selected');
        setTimeout(() => {
            if (oldSelectedItem) oldSelectedItem.classList.remove('closing');
        }, 100);
    }

    currentSelectedIndex = newIndex;
    
    if (newSelectedItem) {
        newSelectedItem.scrollIntoView({
            behavior: 'smooth',
            //manter como center para melhor experiencia e não nearest
            block: 'center'
        });
    }

    const selector = document.getElementById('selector');
    if (!selector || !newSelectedItem) return;
    
    const initialHeight = newSelectedItem.offsetHeight;
    const initialTop = newSelectedItem.offsetTop;
    
    selector.style.top = `${initialTop}px`;
    selector.style.height = `${initialHeight}px`;

    newSelectedItem.classList.add('selected');

    let animationFrameId;
    const updateSelectorDuringTransition = () => {
        const currentHeight = newSelectedItem.offsetHeight;
        const currentTop = newSelectedItem.offsetTop;

        selector.style.top = `${currentTop}px`;
        selector.style.height = `${currentHeight}px`;

        animationFrameId = requestAnimationFrame(updateSelectorDuringTransition);
    };

    requestAnimationFrame(updateSelectorDuringTransition);

    const stopUpdating = () => {
        cancelAnimationFrame(animationFrameId);
        newSelectedItem.removeEventListener('transitionend', stopUpdating);
    };

    newSelectedItem.addEventListener('transitionend', stopUpdating);

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
