import React from 'react';
import { CUSTOM_PICKS_KEY } from '../utils';

export function SettingsSheet({ foods, onImport, onClose, onEnableNotifications, customPicks, setCustomPicks, onOpenSync }) {

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(foods, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fridge_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          onImport(data);
          alert(`成功导入 ${data.length} 条食材数据`);
        } else {
          alert('导入失败：文件内容不是有效的食材数组');
        }
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

  const sectionStyle = {
    padding: '20px', borderRadius: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'
  };
  const sectionTitle = { fontSize: '14px', fontWeight: 600, marginBottom: '14px', color: 'var(--text-secondary)' };
  const btnStyle = {
    width: '100%', padding: '14px', borderRadius: '14px', fontWeight: 600, fontSize: '15px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    transition: 'all 0.2s', cursor: 'pointer'
  };

  return (
    <div className="anim-fade" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        width: '100%', maxWidth: '480px', borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
        padding: '28px 24px 40px', position: 'relative', maxHeight: '85vh', overflowY: 'auto',
        background: 'var(--glass-bg-solid)', border: '1px solid var(--glass-border)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)'
      }}>
        {/* 拖拽手柄 */}
        <div style={{ width: '40px', height: '4px', background: 'var(--text-secondary)', opacity: 0.2, borderRadius: '2px', margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>设置与数据 ⚙️</h2>

        <div style={{ display: 'grid', gap: '16px' }}>

          {/* 📱 数据同步 - 二维码功能放在最前面 */}
          <section style={sectionStyle}>
            <h3 style={sectionTitle}>📱 多设备同步</h3>
            <button onClick={onOpenSync} style={{
              ...btnStyle,
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: '#fff', boxShadow: '0 4px 16px rgba(236,72,153,0.3)',
              border: 'none'
            }}>
              <span style={{ fontSize: '20px' }}>🚀</span> 扫码极速同步
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px', textAlign: 'center' }}>
              生成二维码，另一台手机扫码即可同步全部数据
            </p>
          </section>

          {/* 💾 数据备份 */}
          <section style={sectionStyle}>
            <h3 style={sectionTitle}>💾 数据备份</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={handleExport} style={{
                ...btnStyle, background: 'var(--btn-active-bg)', color: 'var(--text-primary)',
                border: '1px solid var(--input-border)'
              }}>
                📤 导出备份
              </button>
              <label style={{ display: 'block' }}>
                <div style={{
                  ...btnStyle, background: 'var(--btn-active-bg)', color: 'var(--text-primary)',
                  border: '1px solid var(--input-border)'
                }}>
                  📥 导入备份
                </div>
                <input type="file" onChange={handleFileImport} style={{ display: 'none' }} accept=".json" />
              </label>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px', textAlign: 'center' }}>
              所有数据均保存在本地浏览器中，导出文件可用于在其他设备上恢复
            </p>
          </section>

          {/* 🔔 通知 */}
          <section style={sectionStyle}>
            <h3 style={sectionTitle}>🔔 过期提醒</h3>
            <button onClick={onEnableNotifications} style={{
              ...btnStyle, background: 'var(--btn-accent)', color: '#fff', border: 'none',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
            }}>
              🔔 开启到期提醒
            </button>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px', textAlign: 'center' }}>
              开启后每次打开会自动预警过期食材
            </p>
          </section>

          {/* 🌟 常用项管理 */}
          {customPicks.length > 0 && (
            <section style={sectionStyle}>
              <h3 style={sectionTitle}>🌟 我的常用项 ({customPicks.length})</h3>
              <div className="no-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {customPicks.map((p, i) => (
                  <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '14px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--btn-active-bg)', border: '1px solid var(--input-border)',
                      gap: '2px'
                    }}>
                      <span style={{ fontSize: '22px' }}>{p.icon}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{p.name}</span>
                    </div>
                    <button onClick={() => handleDeletePick(i)} style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      background: '#ef4444', color: '#fff', width: '18px', height: '18px',
                      borderRadius: '9px', fontSize: '10px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', border: 'none', lineHeight: 1
                    }}>✕</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 关闭按钮 */}
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button onClick={onClose} style={{ color: 'var(--btn-accent)', fontWeight: 600, fontSize: '15px', padding: '12px 24px' }}>
              关闭设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
