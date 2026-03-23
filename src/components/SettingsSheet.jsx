import React, { useState } from 'react';
import QRCode from 'qrcode';
import { STORAGE_KEY, CUSTOM_PICKS_KEY } from '../utils';

export function SettingsSheet({ foods, onImport, onClose, onEnableNotifications, customPicks, setCustomPicks, onOpenSync }) {
  const handleExport = () => {
    const data = JSON.stringify(foods);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fridge_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) onImport(data);
      } catch {
        alert('导入失败，文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  const handleDeletePick = (idx) => {
    const next = customPicks.filter((_, i) => i !== idx);
    setCustomPicks(next);
    localStorage.setItem(CUSTOM_PICKS_KEY, JSON.stringify(next));
  };

  return (
    <div className="anim-fade" style={{ position: 'fixed', inset: 0, zindex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
      <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '480px', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '32px 24px 40px', position: 'relative',
        maxHeight: '85vh', overflowY: 'auto', background: 'var(--glass-bg-solid)'
      }}>
        <div style={{ width: '40px', height: '4px', background: 'var(--text-secondary)', opacity: 0.2, borderRadius: '2px', margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>设置与管理 ⚙️</h2>

        <div style={{ display: 'grid', gap: '16px' }}>
          <section className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', opacity: 0.8 }}>🔔 消息通知</h3>
            <button onClick={onEnableNotifications} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--btn-accent)', color: '#fff', fontWeight: 600 }}>
              申请/检查通知权限
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>开启后每日打开将自动预警过期食材</p>
          </section>

          <section className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', opacity: 0.8 }}>📱 数据同步</h3>
            <button onClick={onOpenSync} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#ec4899', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>🚀</span> 手机间极速同步 (QR)
            </button>
          </section>

          <section className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', opacity: 0.8 }}>💾 数据备份/导入</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={handleExport} style={{ padding: '12px', borderRadius: '12px', background: 'var(--btn-active-bg)', fontWeight: 600 }}>📤 导出 JSON</button>
              <label style={{ display: 'block' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--btn-active-bg)', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}>📥 导入 JSON</div>
                <input type="file" onChange={handleFileImport} style={{ display: 'none' }} accept=".json" />
              </label>
            </div>
          </section>

          {customPicks.length > 0 && (
            <section className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', opacity: 0.8 }}>🌟 我的常用项</h3>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {customPicks.map((p, i) => (
                  <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                    <div className="glass-panel" style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{p.icon}</div>
                    <button onClick={() => handleDeletePick(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', width: '18px', height: '18px', borderRadius: '9px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button onClick={onClose} style={{ color: 'var(--btn-accent)', fontWeight: 600 }}>关闭设置</button>
          </div>
        </div>
      </div>
    </div>
  );
}
