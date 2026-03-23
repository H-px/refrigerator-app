import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { FoodCard } from './components/FoodCard';
import { FoodFormSheet } from './components/FoodFormSheet';
import { SettingsSheet } from './components/SettingsSheet';
import { SyncModal } from './components/SyncModal';
import { 
  getFoods, saveFoods, getCustomPicks, saveCustomPicks, 
  getTheme, saveTheme, getDaysDifference, getFreshnessStatus, 
  DEFAULT_QUICK_PICKS 
} from './utils';

function App() {
  const [foods, setFoods] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [customPicks, setCustomPicks] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => { 
    const loadedFoods = getFoods();
    setFoods(loadedFoods); 
    setCustomPicks(getCustomPicks());
    document.documentElement.setAttribute('data-theme', theme);
    if (Notification.permission === 'granted') {
      checkAndNotify(loadedFoods);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const handleAdd = (foodData) => {
    const next = [{ id: Date.now().toString(), ...foodData, createdAt: new Date().toISOString() }, ...foods];
    setFoods(next); saveFoods(next); setIsAddOpen(false);
  };

  const handleEdit = (foodData) => {
    const next = foods.map(f => f.id === editingFood.id ? { ...f, ...foodData } : f);
    setFoods(next); saveFoods(next); setEditingFood(null);
  };

  const handleSavePick = (pick) => {
    const next = [pick, ...customPicks];
    setCustomPicks(next);
    saveCustomPicks(next);
  };

  const handleDelete = (id) => {
    const next = foods.filter(f => f.id !== id);
    setFoods(next); saveFoods(next);
  };

  const handleImport = (imported) => {
    const existingIds = new Set(foods.map(f => f.id));
    const newItems = imported.filter(item => !existingIds.has(item.id));
    const next = [...newItems, ...foods];
    setFoods(next);
    saveFoods(next);
    setIsSettingsOpen(false);
  };

  const checkAndNotify = (foodList) => {
    const expiringSoon = foodList.filter(f => {
      const d = getDaysDifference(f.expiryDate);
      return d >= 0 && d <= 3;
    });
    const expired = foodList.filter(f => getDaysDifference(f.expiryDate) < 0);

    if (expiringSoon.length > 0) {
      new Notification('冰箱提醒 🔔', {
        body: `${expiringSoon.map(f => f.name).join('、')} 将在 3 天内过期！`,
        icon: '/refrigerator_app_icon.png',
      });
    }
    if (expired.length > 0) {
      new Notification('已过期食材 ⚠️', {
        body: `${expired.map(f => f.name).join('、')} 已过期，请尽快处理。`,
        icon: '/refrigerator_app_icon.png',
      });
    }
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('您的浏览器不支持推送通知');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      checkAndNotify(foods);
    }
  };

  const stats = useMemo(() => {
    const res = foods.reduce((acc, f) => {
      const status = getFreshnessStatus(getDaysDifference(f.expiryDate));
      acc[status]++; return acc;
    }, { safe: 0, warning: 0, danger: 0, total: foods.length });
    res.onOpenSettings = () => setIsSettingsOpen(true);
    return res;
  }, [foods]);

  const counts = useMemo(() => foods.reduce((acc, f) => {
    acc[f.location]++; return acc;
  }, { all: foods.length, fridge: 0, freezer: 0, pantry: 0 }), [foods]);

  const filteredFoods = useMemo(() => {
    let result = foods;
    if (activeTab !== 'all') {
      result = foods.filter(f => f.location === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => getDaysDifference(a.expiryDate) - getDaysDifference(b.expiryDate));
  }, [foods, activeTab, searchQuery]);

  return (
    <div style={{ paddingBottom: '110px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header stats={stats} theme={theme} toggleTheme={toggleTheme} />
      
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '14px', opacity: 0.5, fontSize: '18px' }}>🔍</span>
          <input 
            type="text" 
            placeholder="搜索食材..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px', height: '48px', borderRadius: '14px', fontSize: '15px' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '12px', background: 'var(--btn-active-bg)', width: '24px', height: '24px', borderRadius: '12px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          )}
        </div>
      </div>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
      
      <main style={{ padding: '0 20px', flex: 1 }}>
        {filteredFoods.length === 0 ? (
          <div className="anim-fade" style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '64px', opacity: 0.4, marginBottom: '16px' }}>
              {activeTab === 'freezer' ? '🧊' : activeTab === 'pantry' ? '🥫' : '🌬️'}
            </div>
            <p style={{ fontWeight: 500 }}>这里空空如也<br/>去买点东西塞进去吧</p>
          </div>
        ) : (
          <div className="anim-fade" key={activeTab}>
            {filteredFoods.map(f => <FoodCard key={f.id} food={f} onDelete={handleDelete} onEdit={setEditingFood} />)}
          </div>
        )}
      </main>

      <button 
        onClick={() => setIsAddOpen(true)} 
        style={{ 
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', 
          height: '56px', padding: '0 32px', borderRadius: '28px', fontSize: '16px', fontWeight: 600, color: '#fff', zIndex: 100, 
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--btn-accent)',
          boxShadow: '0 8px 25px rgba(59,130,246,0.4)',
          border: '2px solid rgba(255,255,255,0.2)'
        }}
      >
        <span style={{ fontSize: '24px', lineHeight: 1 }}>+</span> 放入食材
      </button>

      {isAddOpen && (
        <FoodFormSheet
          title="存入新食物 🛒"
          submitLabel="✅ 记入冰箱"
          allPicks={[...customPicks, ...DEFAULT_QUICK_PICKS]}
          onSavePick={handleSavePick}
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}
      {editingFood && (
        <FoodFormSheet
          title="✏️ 修改食物信息"
          submitLabel="💾 保存修改"
          initialFood={editingFood}
          onClose={() => setEditingFood(null)}
          onSubmit={handleEdit}
        />
      )}
      {isSettingsOpen && (
        <SettingsSheet 
          foods={foods} 
          onImport={handleImport} 
          onClose={() => setIsSettingsOpen(false)} 
          onEnableNotifications={handleEnableNotifications}
          customPicks={customPicks}
          setCustomPicks={setCustomPicks}
          onOpenSync={() => { setIsSettingsOpen(false); setIsSyncOpen(true); }}
        />
      )}
      {isSyncOpen && (
        <SyncModal foods={foods} onClose={() => setIsSyncOpen(false)} />
      )}
    </div>
  );
}

export default App;
