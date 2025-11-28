export const HelpPanel = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      right: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      fontSize: '12px',
      maxWidth: '280px',
      zIndex: 1000
    }}>
      <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>💡 操作提示</h4>
      <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
        <li>🖱️ <strong>單擊物件</strong>：選擇物件</li>
        <li>⌨️ <strong>Ctrl + 單擊</strong>：多選物件</li>
        <li>📦 <strong>Shift + 拖拉</strong>：框選多個物件</li>
        <li>🎯 <strong>拖拉箭頭</strong>：沿軸移動</li>
        <li>📏 <strong>拖拉方塊</strong>：沿軸縮放</li>
        <li>🔄 <strong>切換模式</strong>：移動/縮放</li>
        <li>📐 <strong>對齊按鈕</strong>：對齊多個物件</li>
        <li>🧊 <strong>ViewCube</strong>：點擊切換視角</li>
        <li>🎨 <strong>物件類型</strong>：長方體/圓柱體</li>
      </ul>
    </div>
  );
};
