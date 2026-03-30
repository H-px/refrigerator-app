import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { STORAGE_KEY } from '../utils';

export function SyncModal({ foods, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [syncCode, setSyncCode] = useState('');
  const [activeTab, setActiveTab] = useState('qr');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    generateQR();
  }, [foods]);

  const generateQR = async () => {
    try {
      setError('');
      const data = JSON.stringify(foods);

      // QR 码容量有限 (~4KB)，数据太大时提示
      if (data.length > 3000) {
        setError(`数据量较大 (${foods.length} 条)，二维码可能无法被部分扫码器识别。建议使用"复制代码"方式同步。`);
      }

      const url = await QRCode.toDataURL(data, {
        width: 280,
        margin: 2,
        color: { dark: '#1E293B', light: '#FFFFFF' },
        errorCorrectionLevel: 'L'
      });
      setQrDataUrl(url);
    } catch (err) {
      setError('二维码生成失败：数据量过大，请使用复制代码方式同步');
      console.error('QR generation error:', err);
    }
  };

  const handleCopyCode = async () => {
    const data = JSON.stringify(foods);
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = data;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePasteSync = () => {
    try {
      const data = JSON.parse(syncCode);
      if (!Array.isArray(data)) {
        alert('同步失败：数据格式不正确');
        return;
      }
      if (confirm(`准备同步 ${data.length} 条数据，将与当前数据合并（不覆盖已有项）。是否继续？`)) {
        const existingIds = new Set(foods.map(f => f.id));
        const newItems = data.filter(item => !existingIds.has(item.id));
        const merged = [...newItems, ...foods];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        alert(`同步成功！新增 ${newItems.length} 条，合计 ${merged.length} 条。刷新页面生效。`);
        window.location.reload();
      }
    } catch {
      alert('同步失败，请检查粘贴的代码是否完整。');
    }
  };

  const tabBtnStyle = (isActive) => ({
    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
    background: isActive ? 'var(--btn-bg)' : 'transparent',
    color: isActive ? 'var(--text-title)' : 'var(--text-secondary)',
    boxShadow: isActive ? 'var(--glass-shadow)' : 'none',
    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
  });

  return (
    <div className="anim-fade" style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
      <div style={{
        width: '100%', maxWidth: '400px', borderRadius: '28px', padding: '28px 24px 32px',
        position: 'relative', background: 'var(--glass-bg-solid)',
        border: '1px solid var(--glass-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>数据同步 📱</h2>

        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--btn-active-bg)', padding: '4px', borderRadius: '14px' }}>
          <button onClick={() => setActiveTab('qr')} style={tabBtnStyle(activeTab === 'qr')}>📷 扫码同步</button>
          <button onClick={() => setActiveTab('paste')} style={tabBtnStyle(activeTab === 'paste')}>📋 粘贴代码</button>
        </div>

        {activeTab === 'qr' ? (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              用另一台手机的<strong>相机或扫码器</strong>扫描下方二维码<br />即可快速迁移数据
            </p>

            {/* QR 码区域 */}
            <div style={{
              background: '#fff', padding: '16px', borderRadius: '20px',
              display: 'inline-block', marginBottom: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} style={{ width: '220px', height: '220px', display: 'block' }} alt="Sync QR Code" />
              ) : (
                <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  {error ? '⚠️' : '生成中...'}
                </div>
              )}
            </div>

            {/* 错误/提示信息 */}
            {error && (
              <p style={{ fontSize: '12px', color: 'var(--color-warning)', margin: '0 0 12px', padding: '8px 12px', background: 'var(--color-warning-glow)', borderRadius: '10px', textAlign: 'left' }}>
                ⚠️ {error}
              </p>
            )}

            {/* 复制代码按钮 */}
            <button onClick={handleCopyCode} style={{
              width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px',
              fontWeight: 600, border: '1px solid var(--input-border)',
              background: copied ? 'var(--color-safe-glow)' : 'var(--btn-active-bg)',
              color: copied ? 'var(--color-safe)' : 'var(--text-primary)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {copied ? '✅ 已复制到剪贴板！' : '📋 复制同步代码（用于手动粘贴）'}
            </button>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px' }}>
              当前共 {foods.length} 条食材数据
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
              在此粘贴从另一台设备复制的同步代码：
            </p>
            <textarea
              value={syncCode}
              onChange={e => setSyncCode(e.target.value)}
              placeholder='粘贴同步代码（JSON 格式）...'
              style={{
                height: '140px', fontSize: '12px', fontFamily: 'monospace',
                marginBottom: '16px', resize: 'none', borderRadius: '14px',
                lineHeight: 1.5
              }}
            />
            <button onClick={handlePasteSync} disabled={!syncCode.trim()} style={{
              width: '100%', padding: '14px', borderRadius: '14px',
              background: syncCode.trim() ? 'var(--btn-accent)' : 'var(--btn-active-bg)',
              color: syncCode.trim() ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, border: 'none', cursor: syncCode.trim() ? 'pointer' : 'not-allowed',
              boxShadow: syncCode.trim() ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
              transition: 'all 0.2s'
            }}>
              🔄 执行合并同步
            </button>
          </div>
        )}

        {/* 关闭按钮 */}
        <button onClick={onClose} style={{
          marginTop: '20px', color: 'var(--text-secondary)', fontSize: '14px',
          padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer'
        }}>
          返回
        </button>
      </div>
    </div>
  );
}
