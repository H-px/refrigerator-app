import React, { useState } from 'react';

export function FoodFormSheet({ title, submitLabel, initialFood, allPicks = [], onSavePick, onClose, onSubmit }) {
  const [formData, setFormData] = useState(initialFood || {
    name: '',
    location: 'fridge',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    icon: '📦',
    quantity: 1,
    unit: '个'
  });

  const handlePick = (item) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + item.days);
    setFormData({
      ...formData,
      name: item.name,
      icon: item.icon,
      location: item.loc,
      expiryDate: expiry.toISOString().split('T')[0],
      quantity: item.quantity || 1,
      unit: item.unit || '个'
    });
  };

  const currentUnitTips = ['个', '瓶', '袋', '盒', '斤', 'g', 'ml', '把'];

  return (
    <div className="anim-fade" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
      <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '480px', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '32px 24px 40px', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto', background: 'var(--glass-bg-solid)'
      }}>
        <div style={{ width: '40px', height: '4px', background: 'var(--text-secondary)', opacity: 0.2, borderRadius: '2px', margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>{title}</h2>

        {allPicks.length > 0 && !initialFood && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>快速录入</p>
            <div className="no-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {allPicks.map((item, i) => (
                <button key={i} onClick={() => handlePick(item)} className="glass-panel" style={{ flexShrink: 0, padding: '12px', borderRadius: '16px', background: 'var(--btn-bg)', textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{item.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); onSubmit(formData); }} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>食材名称</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} style={{ width: '60px', textAlign: 'center', fontSize: '24px' }} />
              <input type="text" placeholder="例: 鲜牛奶" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>数量</label>
              <input type="number" step="any" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>单位</label>
              <input type="text" list="unit-list" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
              <datalist id="unit-list">
                {currentUnitTips.map(u => <option key={u} value={u} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>过期日期</label>
            <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>存放位置</label>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--btn-active-bg)', padding: '4px', borderRadius: '12px' }}>
              {['fridge', 'freezer', 'pantry'].map(loc => (
                <button key={loc} type="button" onClick={() => setFormData({...formData, location: loc})} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: formData.location === loc ? 'var(--btn-bg)' : 'transparent', boxShadow: formData.location === loc ? 'var(--glass-shadow)' : 'none' }}>
                  {loc === 'fridge' ? '冷藏' : loc === 'freezer' ? '冷冻' : '室温'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            {!initialFood && (
              <button type="button" onClick={() => { onSavePick({ name: formData.name, icon: formData.icon, days: Math.ceil((new Date(formData.expiryDate)-new Date())/(1000*60*60*24)), loc: formData.location, quantity: formData.quantity, unit: formData.unit }); alert('已存入常用项'); }} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'var(--btn-active-bg)', fontWeight: 600 }}>
                ⭐ 存为常用
              </button>
            )}
            <button type="submit" style={{ flex: 2, padding: '16px', borderRadius: '14px', background: 'var(--btn-accent)', color: '#fff', fontWeight: 700, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
