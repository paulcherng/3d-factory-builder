import { useState, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { ZoneType } from '../types';

export const PropertyEditor = () => {
  const zones = useEditorStore((state) => state.zones);
  const selectedZoneId = useEditorStore((state) => state.selectedZoneId);
  const selectedZoneIds = useEditorStore((state) => state.selectedZoneIds);
  const updateZone = useEditorStore((state) => state.updateZone);

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ZoneType>(ZoneType.BUILDING);
  const [posX, setPosX] = useState('0');
  const [posY, setPosY] = useState('0');
  const [posZ, setPosZ] = useState('0');
  const [dimWidth, setDimWidth] = useState('10');
  const [dimHeight, setDimHeight] = useState('10');
  const [dimDepth, setDimDepth] = useState('10');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 當選中的區域改變時，更新表單
  useEffect(() => {
    if (selectedZone) {
      setName(selectedZone.name);
      setDescription(selectedZone.description);
      setType(selectedZone.type);
      setPosX(String(selectedZone.position[0]));
      setPosY(String(selectedZone.position[1]));
      setPosZ(String(selectedZone.position[2]));
      setDimWidth(String(selectedZone.dimensions[0]));
      setDimHeight(String(selectedZone.dimensions[1]));
      setDimDepth(String(selectedZone.dimensions[2]));
      setErrors({});
    }
  }, [selectedZone]);

  if (!selectedZone) {
    return (
      <div className="empty-state">
        <p>請選擇一個區域</p>
        {selectedZoneIds.length > 1 && (
          <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
            已選擇 {selectedZoneIds.length} 個物件<br/>
            使用對齊按鈕來對齊物件
          </p>
        )}
      </div>
    );
  }

  const handleNameChange = (value: string) => {
    setName(value);
    updateZone(selectedZone.id, { name: value });
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    updateZone(selectedZone.id, { description: value });
  };

  const handleTypeChange = (value: ZoneType) => {
    setType(value);
    updateZone(selectedZone.id, { type: value });
  };

  const handlePositionChange = (axis: 0 | 1 | 2, value: string) => {
    const num = parseFloat(value);
    
    if (isNaN(num) || !isFinite(num)) {
      setErrors(prev => ({ ...prev, [`pos${axis}`]: '無效的數值' }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`pos${axis}`];
      return newErrors;
    });

    const newPosition: [number, number, number] = [...selectedZone.position];
    newPosition[axis] = num;
    updateZone(selectedZone.id, { position: newPosition });
  };

  const handleDimensionChange = (axis: 0 | 1 | 2, value: string) => {
    const num = parseFloat(value);
    
    if (isNaN(num) || !isFinite(num) || num <= 0) {
      setErrors(prev => ({ ...prev, [`dim${axis}`]: '尺寸必須大於 0' }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`dim${axis}`];
      return newErrors;
    });

    const newDimensions: [number, number, number] = [...selectedZone.dimensions];
    newDimensions[axis] = num;
    updateZone(selectedZone.id, { dimensions: newDimensions });
  };

  return (
    <div>
      <h3>屬性</h3>

      <div className="form-group">
        <label>名稱</label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>類型</label>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as ZoneType)}
        >
          {Object.values(ZoneType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>位置 (X, Y, Z)</label>
        <div className="position-inputs">
          <input
            type="number"
            value={posX}
            onChange={(e) => {
              setPosX(e.target.value);
              handlePositionChange(0, e.target.value);
            }}
            className={errors.pos0 ? 'error' : ''}
            placeholder="X"
          />
          <input
            type="number"
            value={posY}
            onChange={(e) => {
              setPosY(e.target.value);
              handlePositionChange(1, e.target.value);
            }}
            className={errors.pos1 ? 'error' : ''}
            placeholder="Y"
          />
          <input
            type="number"
            value={posZ}
            onChange={(e) => {
              setPosZ(e.target.value);
              handlePositionChange(2, e.target.value);
            }}
            className={errors.pos2 ? 'error' : ''}
            placeholder="Z"
          />
        </div>
        {(errors.pos0 || errors.pos1 || errors.pos2) && (
          <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
            {errors.pos0 || errors.pos1 || errors.pos2}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>
          {selectedZone.geometry === 'cylinder' ? '尺寸 (半徑, 高度, 分段)' : '尺寸 (寬, 高, 深)'}
        </label>
        <div className="dimension-inputs">
          <input
            type="number"
            value={dimWidth}
            onChange={(e) => {
              setDimWidth(e.target.value);
              handleDimensionChange(0, e.target.value);
            }}
            className={errors.dim0 ? 'error' : ''}
            placeholder={selectedZone.geometry === 'cylinder' ? '半徑' : '寬'}
            min="0.1"
            step="0.1"
          />
          <input
            type="number"
            value={dimHeight}
            onChange={(e) => {
              setDimHeight(e.target.value);
              handleDimensionChange(1, e.target.value);
            }}
            className={errors.dim1 ? 'error' : ''}
            placeholder="高"
            min="0.1"
            step="0.1"
          />
          <input
            type="number"
            value={dimDepth}
            onChange={(e) => {
              setDimDepth(e.target.value);
              handleDimensionChange(2, e.target.value);
            }}
            className={errors.dim2 ? 'error' : ''}
            placeholder={selectedZone.geometry === 'cylinder' ? '分段' : '深'}
            min={selectedZone.geometry === 'cylinder' ? '3' : '0.1'}
            step={selectedZone.geometry === 'cylinder' ? '1' : '0.1'}
          />
        </div>
        {(errors.dim0 || errors.dim1 || errors.dim2) && (
          <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>
            {errors.dim0 || errors.dim1 || errors.dim2}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>顏色</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={selectedZone.color || '#3498db'}
            onChange={(e) => updateZone(selectedZone.id, { color: e.target.value })}
            style={{ width: '60px', height: '36px', cursor: 'pointer' }}
          />
          <button
            onClick={() => updateZone(selectedZone.id, { color: undefined })}
            style={{ 
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: '#ecf0f1',
              border: '1px solid #bdc3c7',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重置顏色
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>描述</label>
        <textarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="輸入區域描述..."
        />
      </div>
    </div>
  );
};
