export const STORAGE_KEY = 'refrigerator_foods_v2';
export const THEME_KEY = 'refrigerator_theme';
export const CUSTOM_PICKS_KEY = 'refrigerator_custom_picks';

export const getFoods = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
export const saveFoods = (foods) => localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));

export const getCustomPicks = () => { try { return JSON.parse(localStorage.getItem(CUSTOM_PICKS_KEY)) || []; } catch { return []; } };
export const saveCustomPicks = (picks) => localStorage.setItem(CUSTOM_PICKS_KEY, JSON.stringify(picks));

export const getTheme = () => localStorage.getItem(THEME_KEY) || 'light';
export const saveTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
};

export const getDaysDifference = (targetDate) => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate); target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

export const getFreshnessStatus = (days) => days < 0 ? 'danger' : days <= 3 ? 'warning' : 'safe';

export const formatDate = (ds) => new Date(ds).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

export const DEFAULT_QUICK_PICKS = [
  { icon: '🥚', name: '鸡蛋', days: 14, loc: 'fridge', quantity: 1, unit: '个' },
  { icon: '🥛', name: '牛奶', days: 7, loc: 'fridge', quantity: 1, unit: '瓶' },
  { icon: '🥩', name: '鲜肉', days: 3, loc: 'fridge', quantity: 1, unit: '份' },
  { icon: '🥬', name: '绿叶菜', days: 4, loc: 'fridge', quantity: 1, unit: '把' },
  { icon: '🧊', name: '冷冻肉', days: 90, loc: 'freezer', quantity: 1, unit: '份' },
];
