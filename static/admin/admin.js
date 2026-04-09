/**
 * Admin Dashboard JavaScript
 * WB Lima - Gerenciamento de Leads
 */

let currentPage = 1;
let currentFilters = {
    search: '',
    service_type: '',
    email_sent: ''
};

// DOM Elements
const sectionLinks = document.querySelectorAll('.nav-item');
const adminSections = document.querySelectorAll('.admin-section');
const logoutBtn = document.getElementById('logout-btn');
const leadModal = document.getElementById('lead-modal');
const modalClose = document.querySelector('.modal-close');
const closeModalBtn = document.getElementById('close-modal-btn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadDashboardStats();
    loadLeads();
});

function initializeEventListeners() {
    // Navigation
    sectionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });

    // Logout
    logoutBtn.addEventListener('click', logout);

    // Modal
    modalClose.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    leadModal.addEventListener('click', (e) => {
        if (e.target === leadModal) closeModal();
    });

    // Leads filters
    document.getElementById('search-leads')?.addEventListener('input', debounce(filterLeads, 500));
    document.getElementById('filter-service')?.addEventListener('change', filterLeads);
    document.getElementById('filter-email')?.addEventListener('change', filterLeads);

    // Dashboard buttons
    document.getElementById('export-leads-btn')?.addEventListener('click', exportLeads);
    document.getElementById('refresh-stats-btn')?.addEventListener('click', loadDashboardStats);

    // Delete button
    document.getElementById('delete-lead-btn')?.addEventListener('click', deleteLead);
}

function showSection(sectionName) {
    // Update navigation
    sectionLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });

    // Update sections
    adminSections.forEach(section => {
        section.classList.remove('active');
    });
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'leads': 'Leads',
        'settings': 'Configurações'
    };
    document.getElementById('section-title').textContent = titles[sectionName] || 'Dashboard';

    // Load data if needed
    if (sectionName === 'leads') {
        loadLeads();
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/admin/api/stats');
        if (response.status === 401) {
            window.location.href = '/admin';
            return;
        }

        const data = await response.json();
        
        document.getElementById('stat-total').textContent = data.total || 0;
        document.getElementById('stat-today').textContent = data.today || 0;
        document.getElementById('stat-sent').textContent = data.email_sent || 0;
        document.getElementById('stat-pending').textContent = data.pending || 0;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function loadLeads() {
    try {
        const params = new URLSearchParams({
            page: currentPage,
            per_page: 10,
            search: currentFilters.search,
            service_type: currentFilters.service_type,
            email_sent: currentFilters.email_sent
        });

        const response = await fetch(`/admin/api/leads?${params}`);
        
        if (response.status === 401) {
            window.location.href = '/admin';
            return;
        }

        const data = await response.json();
        
        if (!data.success) {
            showEmptyState();
            return;
        }

        renderLeads(data.data);
        renderPagination(data.pagination);
    } catch (error) {
        console.error('Erro ao carregar leads:', error);
        showEmptyState();
    }
}

function renderLeads(leads) {
    const container = document.getElementById('leads-container');

    if (!leads || leads.length === 0) {
        showEmptyState();
        return;
    }

    container.innerHTML = leads.map(lead => `
        <div class="lead-card" onclick="openLeadModal(${lead.id})">
            <div class="lead-card-header">
                <div>
                    <div class="lead-card-name">${escapeHtml(lead.name)}</div>
                    <span class="lead-card-service">${lead.service_type.toUpperCase()}</span>
                </div>
            </div>
            <div class="lead-card-meta">
                <span><i class="fas fa-envelope"></i> ${escapeHtml(lead.email)}</span>
                <span><i class="fas fa-phone"></i> ${escapeHtml(lead.phone)}</span>
            </div>
            <div class="lead-card-meta">
                <span><i class="fas fa-calendar"></i> ${formatDate(lead.created_at)}</span>
            </div>
            <span class="lead-card-status ${lead.email_sent ? 'sent' : 'pending'}">
                <i class="fas fa-${lead.email_sent ? 'check' : 'clock'}"></i>
                ${lead.email_sent ? 'Email Enviado' : 'Pendente'}
            </span>
        </div>
    `).join('');
}

function showEmptyState() {
    const container = document.getElementById('leads-container');
    container.innerHTML = `
        <p class="empty-state">
            <i class="fas fa-inbox"></i>
            Nenhum lead encontrado
        </p>
    `;
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    
    if (pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    
    // Previous button
    if (pagination.has_prev) {
        html += `<button onclick="goToPage(${pagination.page - 1})">← Anterior</button>`;
    } else {
        html += `<button disabled>← Anterior</button>`;
    }

    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.page) {
            html += `<button class="active">${i}</button>`;
        } else if (i <= 2 || i >= pagination.pages - 1 || Math.abs(i - pagination.page) <= 1) {
            html += `<button onclick="goToPage(${i})">${i}</button>`;
        } else if (i === 3 || i === pagination.pages - 2) {
            html += `<button disabled>...</button>`;
        }
    }

    // Next button
    if (pagination.has_next) {
        html += `<button onclick="goToPage(${pagination.page + 1})">Próxima →</button>`;
    } else {
        html += `<button disabled>Próxima →</button>`;
    }

    container.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    loadLeads();
    document.querySelector('.admin-content').scrollTop = 0;
}

function filterLeads() {
    currentFilters.search = document.getElementById('search-leads')?.value || '';
    currentFilters.service_type = document.getElementById('filter-service')?.value || '';
    currentFilters.email_sent = document.getElementById('filter-email')?.value || '';
    currentPage = 1;
    loadLeads();
}

async function openLeadModal(leadId) {
    try {
        const response = await fetch(`/admin/api/leads/${leadId}`);
        
        if (response.status === 401) {
            window.location.href = '/admin';
            return;
        }

        const lead = await response.json();
        
        const detailsHtml = `
            <div class="lead-detail-item">
                <div class="lead-detail-label">Nome</div>
                <div class="lead-detail-value">${escapeHtml(lead.name)}</div>
            </div>
            <div class="lead-detail-item">
                <div class="lead-detail-label">Email</div>
                <div class="lead-detail-value">
                    <a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>
                </div>
            </div>
            <div class="lead-detail-item">
                <div class="lead-detail-label">Telefone</div>
                <div class="lead-detail-value">
                    <a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a>
                </div>
            </div>
            <div class="lead-detail-item">
                <div class="lead-detail-label">Tipo de Serviço</div>
                <div class="lead-detail-value">${lead.service_type.toUpperCase()}</div>
            </div>
            <div class="lead-detail-item">
                <div class="lead-detail-label">Mensagem</div>
                <div class="lead-detail-value">${lead.message ? escapeHtml(lead.message) : '(sem mensagem)'}</div>
            </div>
            <div class="lead-detail-item">
                <div class="lead-detail-label">Status de Email</div>
                <div class="lead-detail-value">
                    ${lead.email_sent ? '✓ Email enviado' : '✗ Pendente'}
                </div>
            </div>
            <div class="lead-detail-item">
                <div class="lead-detail-label">Data de Recebimento</div>
                <div class="lead-detail-value">${formatDateTime(lead.created_at)}</div>
            </div>
            <div class="lead-detail-item">
                <div class="lead-detail-label">IP</div>
                <div class="lead-detail-value">${lead.ip_address || 'N/A'}</div>
            </div>
            ${lead.notes ? `
            <div class="lead-detail-item">
                <div class="lead-detail-label">Notas</div>
                <div class="lead-detail-value">${escapeHtml(lead.notes)}</div>
            </div>
            ` : ''}
        `;

        document.getElementById('lead-details').innerHTML = detailsHtml;
        document.getElementById('delete-lead-btn').setAttribute('data-lead-id', lead.id);
        
        leadModal.classList.add('show');
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes do lead');
    }
}

function closeModal() {
    leadModal.classList.remove('show');
}

async function deleteLead() {
    const leadId = document.getElementById('delete-lead-btn').getAttribute('data-lead-id');
    
    if (!confirm('Tem certeza que deseja deletar este lead?')) {
        return;
    }

    try {
        const response = await fetch(`/admin/api/leads/${leadId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            closeModal();
            loadLeads();
            alert('Lead deletado com sucesso');
        } else {
            alert('Erro ao deletar lead');
        }
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar lead');
    }
}

async function exportLeads() {
    try {
        const response = await fetch('/admin/api/export?format=csv');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Erro ao exportar:', error);
        alert('Erro ao exportar leads');
    }
}

async function logout() {
    try {
        await fetch('/admin/logout', { method: 'POST' });
        window.location.href = '/admin';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        window.location.href = '/admin';
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
