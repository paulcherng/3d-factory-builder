import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';

export const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const labelFontSize = useEditorStore((state) => state.labelFontSize);
  const setLabelFontSize = useEditorStore((state) => state.setLabelFontSize);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const gridSize = useEditorStore((state) => state.gridSize);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          top: '70px',
          left: '10px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px 12px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontSize: '14px'
        }}
      >
        ⚙️ 設定
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      left: '10px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '280px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>⚙️ 編輯器設定</h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          物體名稱字體大小
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="range"
            min="32"
            max="200"
            value={labelFontSize}
            onChange={(e) => setLabelFontSize(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ 
            minWidth: '55px',
            textAlign: 'right',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {labelFontSize}px
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => {
              // 這裡需要添加 setSnapToGrid action
              console.log('Toggle snap to grid:', e.target.checked);
            }}
          />
          <span>啟用網格吸附</span>
        </label>
        {snapToGrid && (
          <div style={{ marginTop: '8px', marginLeft: '24px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '12px',
              color: '#666',
              marginBottom: '4px'
            }}>
              網格大小: {gridSize}
            </label>
          </div>
        )}
      </div>

      <div style={{
        paddingTop: '15px',
        borderTop: '1px solid #eee',
        fontSize: '12px',
        color: '#999'
      }}>
        💡 提示：調整字體大小後，3D 場景中的物體名稱會即時更新
      </div>
    </div>
  );
};
