import React from 'react';

export function Tabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'all', label: '全部', icon: '' },
    { id: 'fridge', label: '冷藏', icon: '❄️' },
    { id: 'freezer', label: '冷冻', icon: '🧊' },
    { id: 'pantry', label: '室温', icon: '🥫' },
  ];

  return (
    <div className="no-scrollbar" style={{ 
      display: 'flex', gap: '8px', padding: '0 20px 20px', overflowX: 'auto', scrollSnapType: 'x mandatory'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`glass-panel ${activeTab === tab.id ? 'active' : ''}`}
          style={{
            padding: '10px 18px', borderRadius: '14px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: 600,
            background: activeTab === tab.id ? 'var(--text-title)' : 'var(--btn-bg)',
            color: activeTab === tab.id ? (activeTab === 'all' ? '#fff' : '#fff') : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '6px', border: 'none', minWidth: '80px', justifyContent: 'center'
          }}
        >
          {tab.label} {tab.icon && <span style={{ fontSize: '12px' }}>{tab.icon}</span>}
          <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: '2px' }}>{counts[tab.id]}</span>
        </button>
      ))}
    </div>
  );
}
