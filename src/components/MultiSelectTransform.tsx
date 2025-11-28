import { useRef, useEffect } from 'react';
import { Group, Vector3, Box3 } from 'three';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { useEditorStore } from '../store/editorStore';

interface MultiSelectTransformProps {
  selectedZoneIds: string[];
  onTransformStart?: () => void;
  onTransformEnd?: () => void;
}

export const MultiSelectTransform = ({ 
  selectedZoneIds,
  onTransformStart: onTransformStartCallback,
  onTransformEnd: onTransformEndCallback
}: MultiSelectTransformProps) => {
  const zones = useEditorStore((state) => state.zones);
  const updateZone = useEditorStore((state) => state.updateZone);
  const transformMode = useEditorStore((state) => state.transformMode);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const gridSize = useEditorStore((state) => state.gridSize);
  const saveHistory = useEditorStore((state) => state.saveHistory);
  
  const groupRef = useRef<Group>(null);
  const transformRef = useRef<any>(null);
  const initialPositions = useRef<Map<string, [number, number, number]>>(new Map());
  const initialDimensions = useRef<Map<string, [number, number, number]>>(new Map());
  const centerPosition = useRef<Vector3>(new Vector3());
  const isTransforming = useRef(false);

  // 只在有多個選中物件時顯示
  if (selectedZoneIds.length <= 1) return null;

  const selectedZones = zones.filter(z => selectedZoneIds.includes(z.id));
  if (selectedZones.length === 0) return null;

  // 計算中心點
  useEffect(() => {
    if (selectedZones.length === 0 || isTransforming.current) return;
    
    const center = new Vector3();
    selectedZones.forEach(zone => {
      center.add(new Vector3(...zone.position));
    });
    center.divideScalar(selectedZones.length);
    centerPosition.current.copy(center);
    
    if (groupRef.current) {
      groupRef.current.position.copy(center);
      groupRef.current.scale.set(1, 1, 1);
    }
  }, [selectedZones.map(z => `${z.position.join(',')}`).join('|')]);

  const handleTransformStart = () => {
    console.log('Transform Start');
    isTransforming.current = true;
    onTransformStartCallback?.();
    saveHistory();
    
    // 記錄初始位置和尺寸
    initialPositions.current.clear();
    initialDimensions.current.clear();
    
    selectedZones.forEach(zone => {
      initialPositions.current.set(zone.id, [...zone.position]);
      initialDimensions.current.set(zone.id, [...zone.dimensions]);
    });
    
    // 記錄初始中心位置（非常重要！）
    if (groupRef.current) {
      const currentCenter = groupRef.current.position.clone();
      centerPosition.current.copy(currentCenter);
      console.log('Initial center:', centerPosition.current);
    }
  };

  const handleTransformChange = () => {
    if (!groupRef.current || !isTransforming.current) return;

    if (transformMode === 'translate') {
      // 計算位移（相對於初始中心位置）
      const currentPos = groupRef.current.position;
      const offset = new Vector3(
        currentPos.x - centerPosition.current.x,
        currentPos.y - centerPosition.current.y,
        currentPos.z - centerPosition.current.z
      );
      
      console.log('Offset:', offset);
      
      // 批量更新所有選中物件的位置
      selectedZones.forEach(zone => {
        const initialPos = initialPositions.current.get(zone.id);
        if (initialPos) {
          const newPosition: [number, number, number] = [
            initialPos[0] + offset.x,
            initialPos[1] + offset.y,
            initialPos[2] + offset.z
          ];
          updateZone(zone.id, { position: newPosition });
        }
      });
      
    } else if (transformMode === 'scale') {
      // 計算縮放比例
      const scale = groupRef.current.scale;
      
      console.log('Scale:', {
        x: scale.x,
        y: scale.y,
        z: scale.z,
        isUniform: scale.x === scale.y && scale.y === scale.z
      });
      
      // 批量更新所有選中物件的尺寸和位置
      selectedZones.forEach(zone => {
        const initialPos = initialPositions.current.get(zone.id);
        const initialDim = initialDimensions.current.get(zone.id);
        
        if (initialPos && initialDim) {
          // 計算相對於中心的偏移
          const relativePos = new Vector3(
            initialPos[0] - centerPosition.current.x,
            initialPos[1] - centerPosition.current.y,
            initialPos[2] - centerPosition.current.z
          );
          
          // 應用縮放
          const scaledPos = new Vector3(
            relativePos.x * scale.x,
            relativePos.y * scale.y,
            relativePos.z * scale.z
          );
          
          // 計算新位置
          const newPosition: [number, number, number] = [
            centerPosition.current.x + scaledPos.x,
            centerPosition.current.y + scaledPos.y,
            centerPosition.current.z + scaledPos.z
          ];
          
          // 計算新尺寸
          const newDimensions: [number, number, number] = [
            Math.max(0.1, initialDim[0] * scale.x),
            Math.max(0.1, initialDim[1] * scale.y),
            Math.max(0.1, initialDim[2] * scale.z)
          ];
          
          updateZone(zone.id, { position: newPosition, dimensions: newDimensions });
        }
      });
    }
  };

  const handleTransformEnd = () => {
    if (!groupRef.current) return;
    
    console.log('Transform End');
    
    if (transformMode === 'scale') {
      // 重置縮放
      groupRef.current.scale.set(1, 1, 1);
    }
    
    // 重新計算並更新中心位置
    const center = new Vector3();
    selectedZones.forEach(zone => {
      center.add(new Vector3(...zone.position));
    });
    center.divideScalar(selectedZones.length);
    centerPosition.current.copy(center);
    groupRef.current.position.copy(center);
    
    // 最後才設置 isTransforming 為 false，讓 useEffect 可以更新
    isTransforming.current = false;
    onTransformEndCallback?.();
  };

  // 計算邊界框
  const boundingBox = new Box3();
  selectedZones.forEach(zone => {
    const min = new Vector3(
      zone.position[0] - zone.dimensions[0] / 2,
      zone.position[1] - zone.dimensions[1] / 2,
      zone.position[2] - zone.dimensions[2] / 2
    );
    const max = new Vector3(
      zone.position[0] + zone.dimensions[0] / 2,
      zone.position[1] + zone.dimensions[1] / 2,
      zone.position[2] + zone.dimensions[2] / 2
    );
    boundingBox.expandByPoint(min);
    boundingBox.expandByPoint(max);
  });

  return (
    <>
      {/* 中心點標記和視覺輔助 */}
      <group ref={groupRef} position={centerPosition.current}>
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.5} />
        </mesh>
      </group>
      
      {/* TransformControls - 必須在 group 外部 */}
      {groupRef.current && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current}
          mode={transformMode}
          onMouseDown={handleTransformStart}
          onChange={handleTransformChange}
          onMouseUp={handleTransformEnd}
          translationSnap={snapToGrid ? gridSize : undefined}
          rotationSnap={null}
          scaleSnap={0.1}
          showX={true}
          showY={true}
          showZ={true}
          size={1.2}
        />
      )}
      
      {/* 邊界框輔助線 */}
      <group position={[
        (boundingBox.max.x + boundingBox.min.x) / 2,
        (boundingBox.max.y + boundingBox.min.y) / 2,
        (boundingBox.max.z + boundingBox.min.z) / 2
      ]}>
        <lineSegments>
          <edgesGeometry args={[
            new THREE.BoxGeometry(
              boundingBox.max.x - boundingBox.min.x,
              boundingBox.max.y - boundingBox.min.y,
              boundingBox.max.z - boundingBox.min.z
            )
          ]} />
          <lineBasicMaterial color="#ffff00" linewidth={2} transparent opacity={0.5} />
        </lineSegments>
      </group>
    </>
  );
};
