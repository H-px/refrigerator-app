import React from 'react';

export function Header({ stats, theme, toggleTheme }) {
  return (
    <header className="glass-panel" style={{ 
      margin: '20px 20px 16px', padding: '24px', borderRadius: '24px', position: 'sticky', top: '20px', zIndex: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' }}>
          我的冰箱 <span style={{ opacity: 0.8 }}>☁️</span>
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={toggleTheme} className="glass-panel" style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--btn-bg)' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={stats.onOpenSettings} className="glass-panel" style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--btn-bg)' }}>
            ⚙️
          </button>
          <div className="glass-panel" style={{ padding: '0 12px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            共 {stats.total} 件
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'var(--color-danger-glow)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-danger)' }}>{stats.danger + stats.warning}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: 500, opacity: 0.8 }}>快吃掉</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'var(--color-safe-glow)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-safe)' }}>{stats.safe}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-safe)', fontWeight: 500, opacity: 0.8 }}>很新鲜</div>
        </div>
      </div>
    </header>
  );
}
