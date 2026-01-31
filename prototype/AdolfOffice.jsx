import React, { useState, useEffect } from 'react';

// Моковые данные агентов
const mockData = {
  agents: [
    { id: "watcher_price_monitor", name: "Мониторинг цен", department: "watcher", status: "ok", task: "Сканирование цен конкурентов", metrics: { products_scanned: 1250, price_changes: 23 }, salary_equivalent: 60000, fte_coefficient: 1.0 },
    { id: "watcher_night_agent", name: "Ночной агент", department: "watcher", status: "ok", task: null, metrics: {}, salary_equivalent: 60000, fte_coefficient: 0.5 },
    { id: "watcher_competitor_scan", name: "Сканер конкурентов", department: "watcher", status: "warning", task: "Высокая нагрузка", metrics: { queue_size: 145 }, salary_equivalent: 60000, fte_coefficient: 1.0 },
    { id: "reputation_wb", name: "WB отзывы", department: "reputation", status: "ok", task: "Обработка отзывов", metrics: { reviews_today: 47, avg_response_min: 12 }, salary_equivalent: 60000, fte_coefficient: 1.0 },
    { id: "reputation_ozon", name: "Ozon отзывы", department: "reputation", status: "error", task: "Ошибка: API timeout", metrics: { reviews_today: 23 }, salary_equivalent: 60000, fte_coefficient: 1.0 },
    { id: "cfo_report", name: "Отчёт P&L", department: "cfo", status: "ok", task: "Формирование отчёта", metrics: { reports_generated: 3 }, salary_equivalent: 80000, fte_coefficient: 1.0 },
    { id: "content_descriptions", name: "Генератор описаний", department: "content_factory", status: "ok", task: "Генерация описаний товаров", metrics: { descriptions_today: 156, queue_size: 23 }, salary_equivalent: 60000, fte_coefficient: 1.0 },
    { id: "content_seo", name: "SEO оптимизатор", department: "content_factory", status: "ok", task: "Анализ ключевых слов", metrics: { keywords_analyzed: 89 }, salary_equivalent: 60000, fte_coefficient: 1.0 },
    { id: "scout_niche", name: "Анализ ниш", department: "scout", status: "offline", task: null, metrics: {}, salary_equivalent: 70000, fte_coefficient: 1.0 },
    { id: "marketing_wb", name: "Реклама WB", department: "marketing", status: "ok", task: "Управление ставками", metrics: { campaigns_active: 12, budget_today: 45000 }, salary_equivalent: 60000, fte_coefficient: 1.0 },
    { id: "knowledge_rag", name: "RAG процессор", department: "knowledge", status: "ok", task: "Индексация документов", metrics: { docs_indexed: 234 }, salary_equivalent: 60000, fte_coefficient: 1.0 },
    { id: "lex_monitor", name: "Правовой мониторинг", department: "lex", status: "ok", task: null, metrics: { changes_detected: 2 }, salary_equivalent: 70000, fte_coefficient: 1.0 },
  ],
  departments: {
    watcher: { name: "Watcher", color: "#4A90D9" },
    reputation: { name: "Reputation", color: "#7ED321" },
    cfo: { name: "CFO", color: "#F5A623" },
    content_factory: { name: "Content Factory", color: "#F5623A" },
    knowledge: { name: "Knowledge", color: "#9B59B6" },
    marketing: { name: "Marketing", color: "#E91E8C" },
    scout: { name: "Scout", color: "#50E3C2" },
    lex: { name: "Lex", color: "#7F8C8D" }
  }
};

// Emoji статусов
const statusEmoji = {
  ok_working: "💡",
  ok_idle: "⏸️",
  warning: "⚠️",
  error: "🛑",
  offline: "💤"
};

const getStatusEmoji = (status, task) => {
  if (status === "ok" && task) return statusEmoji.ok_working;
  if (status === "ok" && !task) return statusEmoji.ok_idle;
  return statusEmoji[status] || "❓";
};

const getStatusColor = (status) => {
  switch(status) {
    case "ok": return "#4CAF50";
    case "warning": return "#FFC107";
    case "error": return "#F44336";
    case "offline": return "#9E9E9E";
    default: return "#9E9E9E";
  }
};

// Компонент карточки агента
const AgentCard = ({ agent, onClick }) => {
  const emoji = getStatusEmoji(agent.status, agent.task);
  const borderColor = getStatusColor(agent.status);
  const isAnimated = agent.status === "warning" || agent.status === "error";
  
  return (
    <div 
      onClick={() => onClick(agent)}
      className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${isAnimated ? 'animate-pulse' : ''}`}
      style={{
        width: '100px',
        padding: '12px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: `3px solid ${borderColor}`,
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{emoji}</div>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        margin: '0 auto 8px',
        backgroundColor: '#E8E8E8',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px'
      }}>
        👤
      </div>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: '600',
        color: '#333',
        lineHeight: '1.2',
        height: '26px',
        overflow: 'hidden'
      }}>
        {agent.name}
      </div>
    </div>
  );
};

// Компонент отдела
const Department = ({ name, color, agents, onAgentClick }) => {
  return (
    <div style={{
      marginBottom: '20px',
      backgroundColor: `${color}15`,
      borderRadius: '16px',
      padding: '16px',
      border: `2px solid ${color}40`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        gap: '8px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color
        }} />
        <span style={{ 
          fontWeight: '700', 
          fontSize: '14px',
          color: '#333',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {name}
        </span>
        <span style={{ 
          fontSize: '12px', 
          color: '#666',
          marginLeft: 'auto'
        }}>
          {agents.length} агентов
        </span>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} onClick={onAgentClick} />
        ))}
      </div>
    </div>
  );
};

// Модальное окно с деталями
const AgentModal = ({ agent, department, onClose }) => {
  if (!agent) return null;
  
  const emoji = getStatusEmoji(agent.status, agent.task);
  const savings = agent.salary_equivalent * agent.fte_coefficient;
  
  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '24px',
          width: '320px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>{agent.name}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Отдел: {department}</div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '24px' }}>{emoji}</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: getStatusColor(agent.status)
          }}>
            {agent.status === 'ok' && agent.task ? 'Работает' : 
             agent.status === 'ok' ? 'Ожидает' :
             agent.status === 'warning' ? 'Внимание' :
             agent.status === 'error' ? 'Ошибка' : 'Не в сети'}
          </span>
        </div>
        
        {agent.task && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Текущая задача</div>
            <div style={{ fontSize: '14px', color: '#333' }}>{agent.task}</div>
          </div>
        )}
        
        {Object.keys(agent.metrics).length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Метрики</div>
            {Object.entries(agent.metrics).map(([key, value]) => (
              <div key={key} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid #eee',
                fontSize: '13px'
              }}>
                <span style={{ color: '#666' }}>{key.replace(/_/g, ' ')}</span>
                <span style={{ fontWeight: '600', color: '#333' }}>{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
        
        <div style={{
          padding: '12px',
          backgroundColor: '#E8F5E9',
          borderRadius: '8px',
          marginTop: '16px'
        }}>
          <div style={{ fontSize: '12px', color: '#2E7D32', marginBottom: '4px' }}>💰 Экономия на ФОТ</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#2E7D32' }}>
            {savings.toLocaleString()} ₽/мес
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            Ставка: {agent.fte_coefficient} × {agent.salary_equivalent.toLocaleString()} ₽
          </div>
        </div>
      </div>
    </div>
  );
};

// Главный компонент
export default function AdolfOffice() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Группировка агентов по отделам
  const groupedAgents = {};
  mockData.agents.forEach(agent => {
    if (!groupedAgents[agent.department]) {
      groupedAgents[agent.department] = [];
    }
    groupedAgents[agent.department].push(agent);
  });
  
  // Подсчёт статистики
  const totalAgents = mockData.agents.length;
  const errorCount = mockData.agents.filter(a => a.status === 'error').length;
  const warningCount = mockData.agents.filter(a => a.status === 'warning').length;
  const totalSavings = mockData.agents.reduce((sum, a) => sum + (a.salary_equivalent * a.fte_coefficient), 0);
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1a2e',
        color: '#fff',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🏢</span>
          <span style={{ fontSize: '20px', fontWeight: '700' }}>ADOLF Office</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'ohana_market', 'ohana_kids'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filter === f ? '#4A90D9' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: filter === f ? '600' : '400'
              }}
            >
              {f === 'all' ? 'Все' : f === 'ohana_market' ? 'Охана Маркет' : 'Охана Кидс'}
            </button>
          ))}
        </div>
        
        <div style={{ 
          backgroundColor: '#2E7D32',
          padding: '8px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>💰</span>
          <span style={{ fontWeight: '700' }}>{totalSavings.toLocaleString()} ₽/мес</span>
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats bar */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '20px' }}>👥</span>
            <span style={{ fontSize: '14px', color: '#666' }}>Агентов:</span>
            <span style={{ fontSize: '18px', fontWeight: '700' }}>{totalAgents}</span>
          </div>
          
          {errorCount > 0 && (
            <div style={{
              backgroundColor: '#FFEBEE',
              padding: '12px 20px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🛑</span>
              <span style={{ fontSize: '14px', color: '#C62828' }}>Ошибок:</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#C62828' }}>{errorCount}</span>
            </div>
          )}
          
          {warningCount > 0 && (
            <div style={{
              backgroundColor: '#FFF8E1',
              padding: '12px 20px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontSize: '14px', color: '#F57F17' }}>Внимание:</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#F57F17' }}>{warningCount}</span>
            </div>
          )}
          
          <div style={{
            marginLeft: 'auto',
            fontSize: '13px',
            color: '#999',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            🔄 Обновлено: {time.toLocaleTimeString('ru-RU')}
          </div>
        </div>
        
        {/* Departments */}
        {Object.entries(groupedAgents).map(([deptKey, agents]) => {
          const dept = mockData.departments[deptKey];
          return (
            <Department
              key={deptKey}
              name={dept.name}
              color={dept.color}
              agents={agents}
              onAgentClick={setSelectedAgent}
            />
          );
        })}
      </div>
      
      {/* Modal */}
      {selectedAgent && (
        <AgentModal
          agent={selectedAgent}
          department={mockData.departments[selectedAgent.department]?.name}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
