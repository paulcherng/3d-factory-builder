import { useRef, memo } from 'react';
import { Mesh, BoxGeometry, CylinderGeometry } from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { TransformControls, Html } from '@react-three/drei';
import { ZoneProps, ZoneType } from '../types';
import { snapPositionToGrid } from '../utils/gridSnap';
import { useEditorStore } from '../store/editorStore';

// 根據區域類型返回顏色
const getZoneColor = (type: ZoneType): string => {
  switch (type) {
    case ZoneType.ADMIN:
      return '#3498db'; // 藍色
    case ZoneType.UTILITY:
      return '#95a5a6'; // 灰色
    case ZoneType.BUILDING:
      return '#e67e22'; // 橙色
    case ZoneType.PRODUCTION:
      return '#e74c3c'; // 紅色
    case ZoneType.WAREHOUSE:
      return '#2ecc71'; // 綠色
    default:
      return '#95a5a6';
  }
};

const Zone3DComponent = ({
  zone,
  isSelected,
  onSelect,
  onPositionChange,
  snapToGrid: shouldSnap,
  gridSize,
  onTransformStart,
  onTransformEnd: onTransformEndCallback
}: ZoneProps) => {
  const meshRef = useRef<Mesh>(null);
  const transformRef = useRef<any>(null);
  const isDraggingRef = useRef(false);
  const color = getZoneColor(zone.type);
  const transformMode = useEditorStore((state) => state.transformMode);
  const updateZone = useEditorStore((state) => state.updateZone);
  const labelFontSize = useEditorStore((state) => state.labelFontSize);

  // 處理變換中（即時更新）
  const handleTransformChange = () => {
    if (!meshRef.current) return;

    if (transformMode === 'translate') {
      // 即時更新位置
      const position = meshRef.current.position;
      const newPosition: [number, number, number] = [position.x, position.y, position.z];
      onPositionChange(newPosition);
    } else if (transformMode === 'scale') {
      // 即時更新尺寸
      const scale = meshRef.current.scale;
      const newDimensions: [number, number, number] = [
        zone.dimensions[0] * scale.x,
        zone.dimensions[1] * scale.y,
        zone.dimensions[2] * scale.z
      ];
      updateZone(zone.id, { dimensions: newDimensions });
    }
  };

  // 處理變換開始
  const handleTransformStart = () => {
    isDraggingRef.current = true;
    onTransformStart?.();
  };

  // 處理變換結束
  const handleTransformEnd = () => {
    if (!meshRef.current) return;
    
    onTransformEndCallback?.();

    if (transformMode === 'translate') {
      // 更新位置（應用網格吸附）
      const position = meshRef.current.position;
      let newPosition: [number, number, number] = [position.x, position.y, position.z];
      
      // 應用網格吸附
      if (shouldSnap) {
        newPosition = snapPositionToGrid(newPosition, gridSize);
      }
      
      onPositionChange(newPosition);
    } else if (transformMode === 'scale') {
      // 重置縮放（已在 onChange 中更新）
      meshRef.current.scale.set(1, 1, 1);
    }

    // 延遲重置拖曳標記，避免立即觸發 onClick
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  // 點擊選擇
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    // 如果剛剛在拖曳，不處理點擊
    if (isDraggingRef.current) return;
    
    e.stopPropagation();
    onSelect();
  };

  // 計算名稱標籤位置（物體上方）
  const labelOffset = zone.geometry === 'cylinder' 
    ? zone.dimensions[1] / 2 + 2  // 圓柱：高度的一半 + 偏移
    : zone.dimensions[1] / 2 + 2; // 長方體：高度的一半 + 偏移

  return (
    <group>
      <mesh
        ref={meshRef}
        position={zone.position}
        onClick={handleClick}
      >
        {/* 幾何形狀 */}
        {zone.geometry === 'cylinder' ? (
          <cylinderGeometry args={[zone.dimensions[0], zone.dimensions[0], zone.dimensions[1], zone.dimensions[2] || 32]} />
        ) : (
          <boxGeometry args={zone.dimensions} />
        )}
        
        {/* 材質 */}
        <meshStandardMaterial
          color={color}
          opacity={0.8}
          transparent
          roughness={0.5}
          metalness={0.2}
        />

        {/* 選中時的邊框 */}
        {isSelected && (
          <lineSegments>
            <edgesGeometry args={[
              zone.geometry === 'cylinder' 
                ? new CylinderGeometry(zone.dimensions[0], zone.dimensions[0], zone.dimensions[1], zone.dimensions[2] || 32)
                : new BoxGeometry(...zone.dimensions)
            ]} />
            <lineBasicMaterial color="#ffff00" linewidth={3} />
          </lineSegments>
        )}
      </mesh>

      {/* 物體名稱標籤 */}
      <Html
        position={[zone.position[0], zone.position[1] + labelOffset, zone.position[2]]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: `${labelFontSize}px`,
          whiteSpace: 'nowrap',
          border: isSelected ? '2px solid #ffff00' : 'none',
          fontWeight: '500'
        }}>
          {zone.name}
        </div>
      </Html>

      {/* Transform Controls - 只在選中時顯示 */}
      {isSelected && meshRef.current && (
        <TransformControls
          ref={transformRef}
          object={meshRef.current}
          mode={transformMode}
          onMouseDown={handleTransformStart}
          onChange={handleTransformChange}
          onMouseUp={handleTransformEnd}
          translationSnap={shouldSnap ? gridSize : undefined}
          rotationSnap={null}
          scaleSnap={0.1}
          showX={true}
          showY={true}
          showZ={true}
          size={0.8}
        />
      )}
    </group>
  );
};


// 使用 memo 優化渲染
export const Zone3D = memo(Zone3DComponent, (prevProps, nextProps) => {
  return (
    prevProps.zone.id === nextProps.zone.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.zone.position[0] === nextProps.zone.position[0] &&
    prevProps.zone.position[1] === nextProps.zone.position[1] &&
    prevProps.zone.position[2] === nextProps.zone.position[2] &&
    prevProps.zone.dimensions[0] === nextProps.zone.dimensions[0] &&
    prevProps.zone.dimensions[1] === nextProps.zone.dimensions[1] &&
    prevProps.zone.dimensions[2] === nextProps.zone.dimensions[2] &&
    prevProps.zone.type === nextProps.zone.type
  );
});
