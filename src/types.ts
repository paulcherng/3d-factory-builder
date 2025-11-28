// 區域類型枚舉
export enum ZoneType {
  ADMIN = 'ADMIN',
  UTILITY = 'UTILITY',
  BUILDING = 'BUILDING',
  PRODUCTION = 'PRODUCTION',
  WAREHOUSE = 'WAREHOUSE'
}

// 幾何形狀類型
export type GeometryType = 'box' | 'cylinder';

// 區域介面
export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  geometry: GeometryType; // 幾何形狀
  position: [number, number, number]; // [x, y, z]
  dimensions: [number, number, number]; // [width, height, depth] 或 [radius, height, segments]
  description: string;
}

// 環境設定介面
export interface EnvironmentSettings {
  fog: {
    enabled: boolean;
    near: number;
    far: number;
    color: string;
  };
  camera: {
    position: [number, number, number];
    fov: number;
  };
  ground: {
    size: number;
    divisions: number;
  };
}

// 編輯器狀態介面
export interface EditorState {
  zones: Zone[];
  selectedZoneId: string | null;
  selectedZoneIds: string[]; // 多選支援
  mode: 'edit' | 'preview';
  environment: EnvironmentSettings;
  snapToGrid: boolean;
  gridSize: number;
  transformMode: 'translate' | 'scale'; // 變換模式
  labelFontSize: number; // 標籤字體大小
}

// Store 介面
export interface EditorStore extends EditorState {
  // Actions
  addZone: (geometry?: GeometryType) => void;
  removeZone: (id: string) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  selectZone: (id: string | null, multiSelect?: boolean) => void;
  selectMultipleZones: (ids: string[]) => void;
  clearSelection: () => void;
  alignZones: (axis: 'x' | 'y' | 'z') => void;
  snapToGround: () => void;
  updateEnvironment: (updates: Partial<EnvironmentSettings>) => void;
  resetEnvironment: () => void;
  exportData: () => string;
  importData: (data: Zone[]) => void;
  setMode: (mode: 'edit' | 'preview') => void;
  setTransformMode: (mode: 'translate' | 'scale') => void;
  setLabelFontSize: (size: number) => void;
}

// Zone 元件 Props
export interface ZoneProps {
  zone: Zone;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (position: [number, number, number]) => void;
  snapToGrid: boolean;
  gridSize: number;
  onTransformStart?: () => void;
  onTransformEnd?: () => void;
}

// PropertyEditor 元件 Props
export interface PropertyEditorProps {
  zone: Zone | null;
  onUpdate: (updates: Partial<Zone>) => void;
}

// EnvironmentControls 元件 Props
export interface EnvironmentControlsProps {
  settings: EnvironmentSettings;
  onUpdate: (updates: Partial<EnvironmentSettings>) => void;
  onReset: () => void;
}
