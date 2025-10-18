// WebSocket connection
let ws = null;
let reconnectTimeout = null;
let agents = new Map();
let activityLog = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Agent Games Dashboard Initialized');
    connectWebSocket();
});

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('✅ WebSocket connected');
            updateConnectionStatus('connected');
            
            // Clear reconnect timeout
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
        };
        
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            updateConnectionStatus('error');
        };
        
        ws.onclose = () => {
            console.log('🔌 WebSocket disconnected');
            updateConnectionStatus('disconnected');
            
            // Attempt to reconnect after 3 seconds
            reconnectTimeout = setTimeout(() => {
                console.log('🔄 Attempting to reconnect...');
                connectWebSocket();
            }, 3000);
        };
    } catch (error) {
        console.error('Failed to create WebSocket:', error);
        updateConnectionStatus('error');
    }
}

function updateConnectionStatus(status) {
    const indicator = document.getElementById('connectionStatus');
    const text = document.getElementById('connectionText');
    
    indicator.className = 'status-indicator';
    
    switch (status) {
        case 'connected':
            indicator.classList.add('connected');
            text.textContent = 'Connected';
            break;
        case 'disconnected':
            indicator.classList.add('disconnected');
            text.textContent = 'Disconnected';
            break;
        case 'error':
            indicator.classList.add('disconnected');
            text.textContent = 'Connection Error';
            break;
        default:
            text.textContent = 'Connecting...';
    }
}

function handleWebSocketMessage(message) {
    console.log('📨 Received:', message.type);
    
    switch (message.type) {
        case 'initial':
            handleInitialData(message.data);
            break;
        case 'update':
            handleAgentUpdate(message.data);
            break;
        case 'trade':
            handleTradeEvent(message.data);
            break;
        case 'death':
            handleDeathEvent(message.data);
            break;
    }
}

function handleInitialData(data) {
    if (Array.isArray(data)) {
        data.forEach(agentData => {
            agents.set(agentData.id, agentData);
        });
        renderAgents();
        updateOverallStats();
    }
}

function handleAgentUpdate(data) {
    if (data.status) {
        agents.set(data.status.id, data.status);
        renderAgents();
        updateOverallStats();
    }
    
    if (data.thought) {
        addActivity('thinking', `${getAgentName(data.agentId)} is thinking: "${data.thought}"`);
    }
}

function handleTradeEvent(data) {
    if (data.trade) {
        const agent = agents.get(data.agentId);
        if (agent) {
            const tradeText = `${agent.name} ${data.trade.action} ${data.trade.amountIn?.toFixed(4)} ${data.trade.tokenIn} → ${data.trade.amountOut?.toFixed(4)} ${data.trade.tokenOut}`;
            const profitText = data.trade.profit > 0 ? `(+${data.trade.profit.toFixed(4)} SOL)` : `(${data.trade.profit.toFixed(4)} SOL)`;
            
            addActivity('trade', `${tradeText} ${profitText}`, '📈');
        }
    }
}

function handleDeathEvent(data) {
    if (data.agentId) {
        const agent = agents.get(data.agentId);
        if (agent) {
            agent.isAlive = false;
            agents.set(data.agentId, agent);
            renderAgents();
            updateOverallStats();
            
            addActivity('death', `💀 ${data.name} has died. Survived for ${data.survivalTime ? formatTime(data.survivalTime) : 'unknown'}. Reason: ${data.reason}`, '💀');
        }
    }
}

function getAgentName(agentId) {
    const agent = agents.get(agentId);
    return agent ? agent.name : 'Agent';
}

function renderAgents() {
    const grid = document.getElementById('agentsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const agentArray = Array.from(agents.values());
    
    if (agentArray.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No agents configured. Please set up agent wallets in .env file.</p>';
        return;
    }
    
    agentArray.forEach(agent => {
        const card = createAgentCard(agent);
        grid.appendChild(card);
    });
}

function createAgentCard(agent) {
    const card = document.createElement('div');
    card.className = `agent-card ${agent.isAlive ? 'alive' : 'dead'} fade-in`;
    
    const recentTrades = agent.recentTrades || [];
    const tradesHTML = recentTrades.slice(-3).map(trade => `
        <div class="trade-item">
            <span>
                <span class="trade-action ${trade.action.toLowerCase()}">${trade.action}</span>
                ${trade.tokenIn} → ${trade.tokenOut}
            </span>
            <span class="trade-profit ${trade.profit >= 0 ? 'positive' : 'negative'}">
                ${trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(4) || '0.0000'} SOL
            </span>
        </div>
    `).join('');
    
    card.innerHTML = `
        <div class="agent-header">
            <div class="agent-info">
                <div class="agent-emoji">${agent.emoji}</div>
                <div>
                    <div class="agent-name">${agent.name}</div>
                </div>
            </div>
            <div class="agent-status ${agent.isAlive ? 'alive' : 'dead'}">
                ${agent.isAlive ? '❤️ Alive' : '💀 Dead'}
            </div>
        </div>
        
        <p class="agent-description">${agent.description}</p>
        
        <div class="agent-stats">
            <div class="stat-item">
                <div class="stat-item-label">Balance</div>
                <div class="stat-item-value">${agent.balance?.toFixed(4) || '0.0000'} SOL</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Survival Time</div>
                <div class="stat-item-value">${agent.survivalTimeFormatted || '0s'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Total Trades</div>
                <div class="stat-item-value">${agent.totalTrades || 0}</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Success Rate</div>
                <div class="stat-item-value">${agent.successRate || 0}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Net Profit</div>
                <div class="stat-item-value ${(agent.netProfit || 0) >= 0 ? 'positive' : 'negative'}">
                    ${(agent.netProfit || 0) >= 0 ? '+' : ''}${agent.netProfit?.toFixed(4) || '0.0000'} SOL
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Costs</div>
                <div class="stat-item-value">${agent.costs?.total?.toFixed(6) || '0.000000'} SOL</div>
            </div>
        </div>
        
        ${agent.lastThought ? `
            <div class="agent-thought">
                <div class="thought-label">💭 Last Thought</div>
                <div class="thought-text">${agent.lastThought}</div>
            </div>
        ` : ''}
        
        ${recentTrades.length > 0 ? `
            <div class="agent-trades">
                <div class="trades-title">Recent Trades</div>
                ${tradesHTML}
            </div>
        ` : ''}
        
        ${agent.isAlive ? `
            <div class="agent-donation">
                <button class="donate-btn" onclick="openDonationModal('${agent.id}', '${agent.name}', '${agent.emoji}')">
                    💝 Donate SOL
                </button>
            </div>
        ` : ''}
    `;
    
    return card;
}

function updateOverallStats() {
    const agentArray = Array.from(agents.values());
    
    // Total balance
    const totalBalance = agentArray.reduce((sum, agent) => sum + (agent.balance || 0), 0);
    document.getElementById('totalBalance').textContent = `${totalBalance.toFixed(4)} SOL`;
    
    // Total trades
    const totalTrades = agentArray.reduce((sum, agent) => sum + (agent.totalTrades || 0), 0);
    document.getElementById('totalTrades').textContent = totalTrades;
    
    // Alive agents
    const aliveCount = agentArray.filter(agent => agent.isAlive).length;
    document.getElementById('aliveAgents').textContent = `${aliveCount} / ${agentArray.length}`;
    
    // Longest survival
    const longestSurvival = Math.max(...agentArray.map(agent => agent.survivalTime || 0), 0);
    document.getElementById('longestSurvival').textContent = formatTime(longestSurvival);
}

function addActivity(type, text, icon = null) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    
    // Remove welcome message on first real activity
    const welcomeMsg = feed.querySelector('.welcome');
    if (welcomeMsg && type !== 'welcome') {
        welcomeMsg.remove();
    }
    
    const item = document.createElement('div');
    item.className = `activity-item ${type}`;
    
    const defaultIcons = {
        trade: '📈',
        death: '💀',
        thinking: '🧠',
        donation: '💝'
    };
    
    const activityIcon = icon || defaultIcons[type] || '📊';
    
    item.innerHTML = `
        <span class="activity-icon">${activityIcon}</span>
        <span class="activity-text">${text}</span>
        <span class="activity-time">${getTimeAgo(Date.now())}</span>
    `;
    
    feed.insertBefore(item, feed.firstChild);
    
    // Keep only last 50 activities
    while (feed.children.length > 50) {
        feed.removeChild(feed.lastChild);
    }
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function getTimeAgo(timestamp) {
    return 'now'; // Simplified for real-time updates
}

// Periodic updates for time displays
setInterval(() => {
    updateOverallStats();
}, 5000); // Update every 5 seconds

// Donation Modal Functions
let currentDonationAgentId = null;

function openDonationModal(agentId, agentName, agentEmoji) {
    currentDonationAgentId = agentId;
    document.getElementById('modalAgentName').textContent = agentName;
    document.getElementById('modalEmoji').textContent = agentEmoji;
    document.getElementById('donationAmount').value = '';
    document.getElementById('donationModal').style.display = 'flex';
}

function closeDonationModal() {
    document.getElementById('donationModal').style.display = 'none';
    currentDonationAgentId = null;
}

function setDonationAmount(amount) {
    document.getElementById('donationAmount').value = amount;
}

async function confirmDonation() {
    const amount = parseFloat(document.getElementById('donationAmount').value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid donation amount');
        return;
    }
    
    if (!currentDonationAgentId) {
        alert('No agent selected');
        return;
    }
    
    try {
        const response = await fetch(`/api/agents/${currentDonationAgentId}/donate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: amount })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Successfully donated ${amount} SOL!`);
            addActivity('donation', `💝 Someone donated ${amount} SOL to ${getAgentName(currentDonationAgentId)}!`, '💝');
            closeDonationModal();
        } else {
            alert(`❌ Donation failed: ${result.error}`);
        }
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('donationModal');
    if (event.target === modal) {
        closeDonationModal();
    }
}

