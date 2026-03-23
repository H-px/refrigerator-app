import React from 'react';
import { getDaysDifference, getFreshnessStatus, formatDate } from '../utils';

export function FoodCard({ food, onDelete, onEdit }) {
  const diff = getDaysDifference(food.expiryDate);
  const status = getFreshnessStatus(diff);
  const statusColor = `var(--color-${status})`;

  return (
    <div className="glass-panel anim-enter" style={{ 
      padding: '16px', borderRadius: '20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: statusColor }} />
      
      <div style={{ fontSize: '32px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--btn-active-bg)', borderRadius: '14px' }}>
        {food.icon || '🍱'}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-title)' }}>{food.name}</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {food.quantity} {food.unit}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: statusColor, padding: '2px 8px', background: `var(--color-${status}-glow)`, borderRadius: '6px' }}>
            {diff < 0 ? `已过期 ${Math.abs(diff)} 天` : diff === 0 ? '今天到期' : `${diff} 天后到期`}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{formatDate(food.expiryDate)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={() => onEdit(food)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--btn-active-bg)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ✏️
        </button>
        <button onClick={() => { if(confirm('确认删除？')) onDelete(food.id) }} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--btn-active-bg)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🗑️
        </button>
      </div>
    </div>
  );
}
