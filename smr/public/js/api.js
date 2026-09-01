// Prefixo usado para formar todas as URLs da API.
const API_URL = '/api';

// Centraliza chamadas HTTP e adiciona o JWT da sessão.
async function fetchAPI(endpoint, options = {}) {
    // Lê o token que foi salvo após o login.
    const token = localStorage.getItem('prev_token');

    // Define JSON como formato padrão e preserva opções personalizadas.
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Envia o token no padrão exigido pelo middleware Bearer.
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Executa a requisição para o endpoint solicitado.
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Se o token expirar ou for inválido, redireciona para o login
    if (response.status === 401) {
        localStorage.removeItem('prev_token');
        if (window.sessionStorage) {
            sessionStorage.clear();
        }
        window.location.replace('/index.html');
        return null;
    }

    // Lê o tipo da resposta antes de convertê-la, pois erros do servidor
    // podem ser páginas HTML e não objetos JSON.
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
        ? await response.json()
        : null;

    // Evita o erro genérico "Unexpected token <" quando o servidor devolve HTML.
    if (!data) {
        throw new Error(`A API respondeu com HTTP ${response.status}. Verifique se o servidor foi atualizado.`);
    }

    if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
    }

    return data;
}

// Protege páginas administrativas exigindo um token local.
function checkAuth() {
    const token = localStorage.getItem('prev_token');
    if (!token) {
        if (window.sessionStorage) {
            sessionStorage.clear();
        }
        window.location.replace('/index.html');
    }
}

// Remove a sessão local e retorna o usuário à tela de login.
function forceLogout() {
    localStorage.removeItem('prev_token');
    if (window.sessionStorage) {
        sessionStorage.clear();
    }
    window.location.replace('/index.html');
}

// Inicializa a sidebar, o overlay, o teclado e o fechamento após navegar.
function setupSidebar() {
    const page = document.body;
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    const links = document.querySelectorAll('.sidebar-link');

    if (!toggle || !overlay) return;

    const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

    const closeSidebar = () => {
        page.classList.remove('sidebar-open');
        page.classList.add('sidebar-collapsed');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
    };

    toggle.addEventListener('click', () => {
        if (isMobile()) {
            const isOpen = page.classList.toggle('sidebar-open');
            page.classList.toggle('sidebar-collapsed', !isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
            return;
        }

        const isCollapsed = page.classList.toggle('sidebar-collapsed');
        toggle.setAttribute('aria-expanded', String(!isCollapsed));
        toggle.setAttribute('aria-label', isCollapsed ? 'Abrir menu' : 'Recolher menu');
    });

    overlay.addEventListener('click', closeSidebar);
    links.forEach((link) => link.addEventListener('click', closeSidebar));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeSidebar();
    });

    // Começa recolhido no celular e aberto no desktop.
    if (isMobile()) {
        closeSidebar();
    } else {
        page.classList.remove('sidebar-collapsed');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Recolher menu');
    }

    window.addEventListener('resize', () => {
        if (isMobile()) {
            page.classList.remove('sidebar-collapsed');
            if (!page.classList.contains('sidebar-open')) closeSidebar();
        } else {
            page.classList.remove('sidebar-open');
            toggle.setAttribute('aria-expanded', String(!page.classList.contains('sidebar-collapsed')));
            toggle.setAttribute('aria-label', page.classList.contains('sidebar-collapsed') ? 'Abrir menu' : 'Recolher menu');
        }
    });
}