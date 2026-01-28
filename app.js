/**
 * ADOLF Office - Main Application
 * Visual dashboard for monitoring AI agents
 */

// ========================================
// Configuration
// ========================================

const CONFIG = {
    DATA_URL: 'data.json',
    UPDATE_INTERVAL: 30000, // 30 seconds
    AVATAR_COUNT: 5
};

// Status emoji mapping
const STATUS_EMOJI = {
    'ok': { withTask: '💡', withoutTask: '⏸️' },
    'warning': '⚠️',
    'error': '🛑',
    'offline': '💤'
};

// Status labels
const STATUS_LABELS = {
    'ok': 'Работает',
    'warning': 'Внимание',
    'error': 'Ошибка',
    'offline': 'Не в сети'
};

// ========================================
// State
// ========================================

let appState = {
    agents: [],
    departments: {},
    lastUpdate: null
};

// ========================================
// DOM Elements
// ========================================

const elements = {
    office: document.getElementById('office'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    updateTime: document.getElementById('updateTime'),
    modalOverlay: document.getElementById('modalOverlay'),
    modal: document.getElementById('modal'),
    modalContent: document.getElementById('modalContent'),
    modalClose: document.getElementById('modalClose')
};

// ========================================
// Utility Functions
// ========================================

/**
 * Get random avatar index (1-5)
 */
function getRandomAvatar() {
    return Math.floor(Math.random() * CONFIG.AVATAR_COUNT) + 1;
}

/**
 * Get status emoji based on agent status and task
 */
function getStatusEmoji(status, task) {
    if (status === 'ok') {
        return task ? STATUS_EMOJI.ok.withTask : STATUS_EMOJI.ok.withoutTask;
    }
    return STATUS_EMOJI[status] || '❓';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'Неизвестно';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
        return 'Только что';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} мин. назад`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} ч. назад`;
    }
    
    // Format as date
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format metric value
 */
function formatMetricValue(value) {
    if (typeof value === 'number') {
        return value.toLocaleString('ru-RU');
    }
    return value;
}

/**
 * Convert metric key to readable name
 */
function formatMetricName(key) {
    const names = {
        'products_scanned': 'Товаров просканировано',
        'price_changes': 'Изменений цен',
        'queue_size': 'Размер очереди',
        'reviews_today': 'Отзывов сегодня',
        'avg_response_min': 'Среднее время ответа (мин)',
        'reports_generated': 'Отчётов сгенерировано',
        'descriptions_today': 'Описаний сегодня'
    };
    return names[key] || key;
}

// ========================================
// Data Loading
// ========================================

/**
 * Fetch data from JSON file
 */
async function fetchData() {
    try {
        const response = await fetch(CONFIG.DATA_URL + '?t=' + Date.now());
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

/**
 * Load and process data
 */
async function loadData() {
    try {
        const data = await fetchData();
        
        appState.agents = data.agents || [];
        appState.departments = data.departments || {};
        appState.lastUpdate = new Date();
        
        hideError();
        renderOffice();
        updateTime();
        
    } catch (error) {
        showError();
    } finally {
        hideLoading();
    }
}

// ========================================
// Rendering
// ========================================

/**
 * Group agents by department
 */
function groupAgentsByDepartment() {
    const groups = {};
    
    for (const agent of appState.agents) {
        const dept = agent.department;
        if (!groups[dept]) {
            groups[dept] = [];
        }
        groups[dept].push(agent);
    }
    
    return groups;
}

/**
 * Render the entire office
 */
function renderOffice() {
    const groups = groupAgentsByDepartment();
    
    // Sort departments alphabetically
    const sortedDepts = Object.keys(groups).sort();
    
    // Clear office
    elements.office.innerHTML = '';
    
    // Render each department
    for (const deptKey of sortedDepts) {
        const agents = groups[deptKey];
        const deptInfo = appState.departments[deptKey] || { 
            name: deptKey, 
            color: '#7f8c8d' 
        };
        
        const deptElement = renderDepartment(deptKey, deptInfo, agents);
        elements.office.appendChild(deptElement);
    }
}

/**
 * Render a department section
 */
function renderDepartment(deptKey, deptInfo, agents) {
    const section = document.createElement('section');
    section.className = 'department';
    section.style.setProperty('--dept-color', deptInfo.color);
    
    section.innerHTML = `
        <div class="department__header" style="border-color: ${deptInfo.color}">
            <span class="department__color-dot" style="background-color: ${deptInfo.color}"></span>
            <h2 class="department__name">${deptInfo.name}</h2>
            <span class="department__count">${agents.length} агент${getAgentSuffix(agents.length)}</span>
        </div>
        <div class="department__agents">
            ${agents.map(agent => renderAgentCard(agent)).join('')}
        </div>
    `;
    
    // Add click handlers to agent cards
    section.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', () => {
            const agentId = card.dataset.agentId;
            const agent = appState.agents.find(a => a.id === agentId);
            if (agent) {
                showModal(agent);
            }
        });
    });
    
    return section;
}

/**
 * Get correct suffix for agent count
 */
function getAgentSuffix(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'ов';
    }
    if (lastDigit === 1) {
        return '';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'а';
    }
    return 'ов';
}

/**
 * Render an agent card
 */
function renderAgentCard(agent) {
    const statusEmoji = getStatusEmoji(agent.status, agent.task);
    const avatarNum = getRandomAvatar();
    const statusClass = `agent-card--${agent.status}`;
    
    return `
        <div class="agent-card ${statusClass}" data-agent-id="${agent.id}">
            <span class="agent-card__status">${statusEmoji}</span>
            <img 
                class="agent-card__avatar" 
                src="avatars/worker${avatarNum}.gif" 
                alt="${agent.name}"
                loading="lazy"
            >
            <span class="agent-card__name">${agent.name}</span>
        </div>
    `;
}

/**
 * Update the time display
 */
function updateTime() {
    if (appState.lastUpdate) {
        const time = appState.lastUpdate.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        elements.updateTime.textContent = `Обновлено: ${time}`;
    }
}

// ========================================
// Modal
// ========================================

/**
 * Show modal with agent details
 */
function showModal(agent) {
    const deptInfo = appState.departments[agent.department] || { 
        name: agent.department, 
        color: '#7f8c8d' 
    };
    
    const statusEmoji = getStatusEmoji(agent.status, agent.task);
    const statusLabel = STATUS_LABELS[agent.status] || agent.status;
    const avatarNum = getRandomAvatar();
    
    // Build metrics HTML
    let metricsHtml = '';
    if (agent.metrics && Object.keys(agent.metrics).length > 0) {
        metricsHtml = `
            <div class="modal__section">
                <h4 class="modal__section-title">Метрики</h4>
                <ul class="modal__metrics">
                    ${Object.entries(agent.metrics).map(([key, value]) => `
                        <li class="modal__metric">
                            <span class="modal__metric-name">${formatMetricName(key)}</span>
                            <span class="modal__metric-value">${formatMetricValue(value)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    elements.modalContent.innerHTML = `
        <div class="modal__header">
            <img class="modal__avatar" src="avatars/worker${avatarNum}.gif" alt="${agent.name}">
            <div>
                <h3 class="modal__title">${agent.name}</h3>
                <p class="modal__department">
                    <span style="color: ${deptInfo.color}">●</span> ${deptInfo.name}
                </p>
            </div>
        </div>
        
        <div class="modal__section">
            <h4 class="modal__section-title">Статус</h4>
            <span class="modal__status modal__status--${agent.status}">
                ${statusEmoji} ${statusLabel}
            </span>
        </div>
        
        <div class="modal__section">
            <h4 class="modal__section-title">Текущая задача</h4>
            <p class="modal__task ${!agent.task ? 'modal__task--empty' : ''}">
                ${agent.task || 'Нет активной задачи'}
            </p>
        </div>
        
        ${metricsHtml}
        
        <div class="modal__section">
            <h4 class="modal__section-title">Последняя активность</h4>
            <p class="modal__last-activity">${formatDate(agent.last_activity)}</p>
        </div>
    `;
    
    elements.modalOverlay.classList.add('modal-overlay--visible');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide modal
 */
function hideModal() {
    elements.modalOverlay.classList.remove('modal-overlay--visible');
    document.body.style.overflow = '';
}

// ========================================
// UI Helpers
// ========================================

function hideLoading() {
    elements.loading.style.display = 'none';
}

function showError() {
    elements.errorMessage.style.display = 'block';
}

function hideError() {
    elements.errorMessage.style.display = 'none';
}

// ========================================
// Event Listeners
// ========================================

// Close modal on button click
elements.modalClose.addEventListener('click', hideModal);

// Close modal on overlay click
elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) {
        hideModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideModal();
    }
});

// ========================================
// Initialization
// ========================================

/**
 * Initialize the application
 */
async function init() {
    // Initial load
    await loadData();
    
    // Set up periodic updates
    setInterval(loadData, CONFIG.UPDATE_INTERVAL);
}

// Start the app
init();
