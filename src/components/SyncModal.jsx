import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Html5QrcodeScanner } from 'html5-qrcode';
import pako from 'pako';
import { STORAGE_KEY } from '../utils';

// Helper: Uint8Array to Base64 (防止栈溢出)
function uint8ArrayToBase64(uint8Array) {
  let binary = '';
  const len = uint8Array.byteLength;
  // 分块处理防止参数过多
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return window.btoa(binary);
}

// Helper: Base64 to Uint8Array
function base64ToUint8Array(base64) {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// 压缩和解压缩核心逻辑
function compressData(foods) {
  const jsonStr = JSON.stringify(foods);
  const compressed = pako.deflate(jsonStr);
  const base64 = uint8ArrayToBase64(compressed);
  return 'refr://' + base64;
}

function decompressData(dataStr) {
  if (dataStr.startsWith('refr://')) {
    dataStr = dataStr.replace('refr://', '');
  } else {
    // 兼容历史直接未压缩的 Json 测试代码
    try {
        return JSON.parse(dataStr);
    } catch(e) { /* ignore */ }
  }
  try {
    const bytes = base64ToUint8Array(dataStr);
    const decompressedStr = pako.inflate(bytes, { to: 'string' });
    return JSON.parse(decompressedStr);
  } catch (err) {
    throw new Error('解析数据失败：数据损坏或不受支持。');
  }
}

export function SyncModal({ foods, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [syncCode, setSyncCode] = useState('');
  const [activeTab, setActiveTab] = useState('show'); // show | scan | paste
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  // 挂载或更新食品时生成压缩的二维码
  useEffect(() => {
    generateQR();
  }, [foods]);

  // Tab 切换时处理 Scanner 生命周期
  useEffect(() => {
    if (activeTab === 'scan') {
      // 防止重复实例
      if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        scanner.render(
          (decodedText) => {
            scanner.pause(true); // 扫描成功后暂停
            handleScanSuccess(decodedText, scanner);
          },
          (err) => {
            // 忽略扫描中未找到二维码的常规报错
          }
        );
        scannerRef.current = scanner;
      }
    } else {
      // 切换走时清理摄像头
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [activeTab]);

  const generateQR = async () => {
    try {
      setError('');
      const compressedPayload = compressData(foods);
      
      const url = await QRCode.toDataURL(compressedPayload, {
        width: 260,
        margin: 2,
        color: { dark: '#1E293B', light: '#FFFFFF' },
        errorCorrectionLevel: 'M'
      });
      setQrDataUrl(url);
    } catch (err) {
      setError('二维码生成失败：编码遇到未知错误。');
      console.error('QR generation error:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      const payload = compressData(foods);
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const payload = compressData(foods);
      const ta = document.createElement('textarea');
      ta.value = payload;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const performMerge = (parsedData) => {
    if (!Array.isArray(parsedData)) {
      alert('同步失败：数据格式不正确');
      return;
    }
    if (confirm(`成功解析！包含 ${parsedData.length} 条数据，将与当前数据合并（不覆盖已有相似项）。是否继续？`)) {
      const existingIds = new Set(foods.map(f => f.id));
      const newItems = parsedData.filter(item => !existingIds.has(item.id));
      const merged = [...newItems, ...foods];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      alert(`同步合并成功！新增 ${newItems.length} 条数据。页面即将刷新。`);
      window.location.reload();
    }
  }

  const handleScanSuccess = (decodedText, scanner) => {
    try {
      const parsedData = decompressData(decodedText);
      performMerge(parsedData);
      // 无论确认还是取消，恢复扫描
      if (scanner && scanner.getState() === 2) {
          scanner.resume();
      }
    } catch (err) {
      alert('无法解析此二维码内容：' + err.message);
      if (scanner && scanner.getState() === 2) {
          scanner.resume();
      }
    }
  };

  const handlePasteSync = () => {
    try {
      const parsedData = decompressData(syncCode.trim());
      performMerge(parsedData);
    } catch (err) {
      alert('同步失败，请检查粘贴的代码是否完整或有效：' + err.message);
    }
  };

  const tabBtnStyle = (isActive) => ({
    flex: 1, padding: '10px 4px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
    background: isActive ? 'var(--btn-bg)' : 'transparent',
    color: isActive ? 'var(--text-title)' : 'var(--text-secondary)',
    boxShadow: isActive ? 'var(--glass-shadow)' : 'none',
    border: 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
  });

  return (
    <div className="anim-fade" style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
      <div style={{
        width: '100%', maxWidth: '420px', borderRadius: '28px', padding: '28px 20px 32px',
        position: 'relative', background: 'var(--glass-bg-solid)',
        border: '1px solid var(--glass-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>数据同步 📱</h2>

        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--btn-active-bg)', padding: '4px', borderRadius: '14px' }}>
          <button onClick={() => setActiveTab('show')} style={tabBtnStyle(activeTab === 'show')}>📤 出示二维码</button>
          <button onClick={() => setActiveTab('scan')} style={tabBtnStyle(activeTab === 'scan')}>📷 扫描二维码</button>
          <button onClick={() => setActiveTab('paste')} style={tabBtnStyle(activeTab === 'paste')}>📋 粘贴代码</button>
        </div>

        {activeTab === 'show' && (
          <div className="anim-fade">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              使用另一台设备的<strong>“扫描二维码”</strong>功能，即可快速迁移合并当前设备的数据。
            </p>

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

            {error && (
              <p style={{ fontSize: '12px', color: 'var(--color-warning)', margin: '0 0 12px', padding: '8px 12px', background: 'var(--color-warning-glow)', borderRadius: '10px', textAlign: 'left' }}>
                ⚠️ {error}
              </p>
            )}

            <button onClick={handleCopyCode} style={{
              width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px',
              fontWeight: 600, border: '1px solid var(--input-border)',
              background: copied ? 'var(--color-safe-glow)' : 'var(--btn-active-bg)',
              color: copied ? 'var(--color-safe)' : 'var(--text-primary)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {copied ? '✅ 同步代码已复制！' : '📋 复制同步代码 (若无法扫码)'}
            </button>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px' }}>
              当前共压缩 {foods.length} 条食材数据
            </p>
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="anim-fade" style={{ textAlign: 'left' }}>
             <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6, textAlign: 'center' }}>
              请对准另一台设备出现的“出示二维码”进行扫描
            </p>
            {/* 扫码器挂载点 */}
            <div id="qr-reader" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--input-border)', background: 'var(--btn-active-bg)' }}></div>
            
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '16px', textAlign: 'center' }}>
              扫描完成后会自动提示您确认合并的数据量。
            </p>
          </div>
        )}

        {activeTab === 'paste' && (
          <div className="anim-fade" style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
              在此粘贴从另一台设备复制的同步加密代码（支持 `refr://` 格式）：
            </p>
            <textarea
              value={syncCode}
              onChange={e => setSyncCode(e.target.value)}
              placeholder='粘贴以 "refr://" 开头的同步代码...'
              style={{
                width: '100%', height: '140px', fontSize: '12px', fontFamily: 'monospace',
                marginBottom: '16px', resize: 'none', borderRadius: '14px',
                padding: '12px',
                lineHeight: 1.5, boxSizing: 'border-box', border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)', color: 'var(--text-primary)'
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

        {/* 返回关闭按钮 */}
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
