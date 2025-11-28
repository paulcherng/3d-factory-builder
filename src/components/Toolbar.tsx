import { useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { Zone } from '../types';

export const Toolbar = () => {
  const addZone = useEditorStore((state) => state.addZone);
  const removeZone = useEditorStore((state) => state.removeZone);
  const selectedZoneId = useEditorStore((state) => state.selectedZoneId);
  const selectedZoneIds = useEditorStore((state) => state.selectedZoneIds);
  const alignZones = useEditorStore((state) => state.alignZones);
  const snapToGround = useEditorStore((state) => state.snapToGround);
  const exportData = useEditorStore((state) => state.exportData);
  const importData = useEditorStore((state) => state.importData);
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const transformMode = useEditorStore((state) => state.transformMode);
  const setTransformMode = useEditorStore((state) => state.setTransformMode);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = exportData();
      
      // 創建下載連結
      const blob = new Blob([data], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'factory-zones.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('匯出成功！');
    } catch (error) {
      alert('匯出失敗：' + (error as Error).message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      
      // 嘗試解析 JSON
      let data: Zone[];
      
      // 如果是 const FACTORY_ZONES = [...] 格式
      if (text.includes('FACTORY_ZONES')) {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('無法解析檔案格式');
        }
      } else {
        // 直接解析 JSON
        data = JSON.parse(text);
      }

      importData(data);
      alert('匯入成功！');
    } catch (error) {
      alert('匯入失敗：' + (error as Error).message);
    }

    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = () => {
    if (!selectedZoneId) return;
    
    if (confirm('確定要刪除此區域嗎？')) {
      removeZone(selectedZoneId);
    }
  };

  return (
    <div className="toolbar">
      <h1 style={{ fontSize: '20px', marginRight: 'auto' }}>3D 工廠佈局編輯器</h1>
      
      {mode === 'edit' ? (
        <>
          <button onClick={() => addZone('box')}>➕ 長方體</button>
          <button onClick={() => addZone('cylinder')}>➕ 圓柱體</button>
          <button 
            className="danger" 
            onClick={handleDelete}
            disabled={!selectedZoneId}
          >
            刪除
          </button>
          
          <div style={{ borderLeft: '1px solid #ddd', height: '30px', margin: '0 10px' }}></div>
          
          {/* 變換模式切換 */}
          <button 
            onClick={() => setTransformMode('translate')}
            style={{ 
              backgroundColor: transformMode === 'translate' ? '#3498db' : undefined,
              color: transformMode === 'translate' ? 'white' : undefined
            }}
          >
            移動
          </button>
          <button 
            onClick={() => setTransformMode('scale')}
            style={{ 
              backgroundColor: transformMode === 'scale' ? '#3498db' : undefined,
              color: transformMode === 'scale' ? 'white' : undefined
            }}
          >
            縮放
          </button>
          
          <div style={{ borderLeft: '1px solid #ddd', height: '30px', margin: '0 10px' }}></div>
          
          {/* 對齊按鈕 */}
          <button 
            onClick={() => alignZones('x')}
            disabled={selectedZoneIds.length < 2}
            title="沿 X 軸對齊"
          >
            對齊 X
          </button>
          <button 
            onClick={() => alignZones('y')}
            disabled={selectedZoneIds.length < 2}
            title="沿 Y 軸對齊"
          >
            對齊 Y
          </button>
          <button 
            onClick={() => alignZones('z')}
            disabled={selectedZoneIds.length < 2}
            title="沿 Z 軸對齊"
          >
            對齊 Z
          </button>
          <button 
            onClick={snapToGround}
            disabled={selectedZoneIds.length === 0}
            title="貼附到底面"
          >
            ⬇️ 貼地
          </button>
          
          <div style={{ borderLeft: '1px solid #ddd', height: '30px', margin: '0 10px' }}></div>
          
          <button onClick={handleImportClick}>匯入</button>
          <button onClick={handleExport}>匯出</button>
          <button onClick={() => setMode('preview')}>預覽</button>
          
          {selectedZoneIds.length > 1 && (
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
              已選擇 {selectedZoneIds.length} 個物件
            </span>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.js"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </>
      ) : (
        <button onClick={() => setMode('edit')}>返回編輯</button>
      )}
    </div>
  );
};
