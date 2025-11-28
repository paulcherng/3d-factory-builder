import { EnvironmentSettings, ZoneType, Zone, GeometryType } from '../types';

// 預設環境設定
export const getDefaultEnvironment = (): EnvironmentSettings => ({
  fog: {
    enabled: true,
    near: 10,
    far: 100,
    color: '#cccccc'
  },
  camera: {
    position: [50, 50, 50],
    fov: 75
  },
  ground: {
    size: 200,
    divisions: 20
  }
});

// 生成唯一 ID
let zoneCounter = 1;

export const generateZoneId = (type: ZoneType): string => {
  const id = `${type}_${String(zoneCounter).padStart(2, '0')}`;
  zoneCounter++;
  return id;
};

// 重置計數器（用於測試）
export const resetZoneCounter = (): void => {
  zoneCounter = 1;
};

// 創建預設區域
export const createDefaultZone = (geometry: 'box' | 'cylinder' = 'box'): Zone => {
  const type = ZoneType.BUILDING;
  return {
    id: generateZoneId(type),
    name: geometry === 'cylinder' ? '新圓柱' : '新區域',
    type,
    geometry,
    position: [0, 5, 0],
    dimensions: geometry === 'cylinder' ? [5, 10, 32] : [10, 10, 10], // [radius, height, segments] or [width, height, depth]
    description: ''
  };
};
