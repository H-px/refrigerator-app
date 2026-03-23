import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export function SyncModal({ foods, onClose }) {
  const [qrData, setQrData] = useState('');
  const [syncCode, setSyncCode] = useState('');
  const [activeTab, setActiveTab] = useState('qr');

  useEffect(() => {
    const data = JSON.stringify(foods);
    QRCode.toDataURL(data, { width: 280, margin: 2 })
      .then(url => setQrData(url))
      .catch(err => console.error(err));
  }, [foods]);

  const handlePasteSync = () => {
    try {
      const data = JSON.parse(syncCode);
      if (Array.isArray(data)) {
        if (confirm(`准备同步 ${data.length} 条数据，将与当前数据合并。是否继续？`)) {
          const existingIds = new Set(foods.map(f => f.id));
          const newItems = data.filter(item => !existingIds.has(item.id));
          const next = [...newItems, ...foods];
          localStorage.setItem('refrigerator_foods_v2', JSON.stringify(next));
          alert('同步成功！请刷新页面。');
          window.location.reload();
        }
      }
    } catch {
      alert('同步失败，代码格式不正确。');
    }
  };

  return (
    <div className="anim-fade" style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
      <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '400px', borderRadius: '32px', padding: '32px', position: 'relative', background: 'var(--glass-bg-solid)', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>数据同步 📱</h2>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--btn-active-bg)', padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setActiveTab('qr')} style={{ flex: 1, padding: '8px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: activeTab === 'qr' ? 'var(--btn-bg)' : 'transparent', boxShadow: activeTab === 'qr' ? 'var(--glass-shadow)' : 'none' }}>扫码同步</button>
          <button onClick={() => setActiveTab('paste')} style={{ flex: 1, padding: '8px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: activeTab === 'paste' ? 'var(--btn-bg)' : 'transparent', boxShadow: activeTab === 'paste' ? 'var(--glass-shadow)' : 'none' }}>粘贴代码</button>
        </div>

        {activeTab === 'qr' ? (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>使用另一台手机扫描下方二维码<br/>即可快速迁移数据</p>
            <div className="glass-panel" style={{ background: '#fff', padding: '16px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px' }}>
              {qrData ? <img src={qrData} style={{ width: '200px', height: '200px', display: 'block' }} alt="Sync QR" /> : <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>生成中...</div>}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>在此粘贴从另一台设备复制的同步代码：</p>
            <textarea 
              value={syncCode}
              onChange={e => setSyncCode(e.target.value)}
              placeholder="粘贴同步代码..."
              style={{ height: '120px', fontSize: '12px', fontFamily: 'monospace', marginBottom: '16px', resize: 'none' }}
            />
            <button onClick={handlePasteSync} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--btn-accent)', color: '#fff', fontWeight: 600 }}>
              执行合并同步
            </button>
          </div>
        )}

        <button onClick={onClose} style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>返回</button>
      </div>
    </div>
  );
}
