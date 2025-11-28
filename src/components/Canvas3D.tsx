import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewcube } from '@react-three/drei';
import { useEditorStore } from '../store/editorStore';
import { Zone3D } from './Zone3D';
import { SelectionBoxHelper } from './SelectionBoxOverlay';
import { MultiSelectTransform } from './MultiSelectTransform';
import { useRef, useState, useEffect } from 'react';

interface Canvas3DProps {
  isPreview?: boolean;
}

export const Canvas3D = ({ isPreview = false }: Canvas3DProps) => {
  const environment = useEditorStore((state) => state.environment);
  const zones = useEditorStore((state) => state.zones);
  const selectedZoneIds = useEditorStore((state) => state.selectedZoneIds);
  const selectZone = useEditorStore((state) => state.selectZone);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const updateZone = useEditorStore((state) => state.updateZone);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const gridSize = useEditorStore((state) => state.gridSize);
  
  const orbitControlsRef = useRef<any>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // 監聽 Shift 鍵狀態
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <>
      <Canvas
        camera={{
          position: environment.camera.position,
          fov: environment.camera.fov
        }}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={() => {
          if (!isPreview) {
            clearSelection();
          }
        }}
      >
      {/* 選擇框輔助器 */}
      {!isPreview && <SelectionBoxHelper />}
      
      {/* 環境光 */}
      <ambientLight intensity={0.5} />
      
      {/* 方向光 */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />

      {/* 霧效 */}
      {environment.fog.enabled && (
        <fog
          attach="fog"
          args={[environment.fog.color, environment.fog.near, environment.fog.far]}
        />
      )}

      {/* 地面網格 */}
      <Grid
        args={[environment.ground.size, environment.ground.size]}
        cellSize={environment.ground.size / environment.ground.divisions}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={environment.ground.size / 10}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={environment.ground.size * 2}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />

      {/* 攝影機控制 */}
      <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={200}
        enabled={!isTransforming && !isShiftPressed} // 變換時或按住 Shift 時禁用
        makeDefault
      />

      {/* 座標軸輔助器 */}
      <axesHelper args={[20]} />

      {/* ViewCube - 視角控制方塊 */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewcube
          color="white"
          strokeColor="black"
          textColor="black"
          hoverColor="#3498db"
          opacity={0.8}
        />
      </GizmoHelper>

      {/* 渲染所有區域 */}
      {zones.map((zone) => (
        <Zone3D
          key={zone.id}
          zone={zone}
          isSelected={selectedZoneIds.includes(zone.id)}
          onSelect={() => selectZone(zone.id)}
          onPositionChange={(position) => updateZone(zone.id, { position })}
          snapToGrid={snapToGrid}
          gridSize={gridSize}
          onTransformStart={() => setIsTransforming(true)}
          onTransformEnd={() => setIsTransforming(false)}
          hideTransformControls={selectedZoneIds.length > 1} // 多選時隱藏單個物件的控制器
        />
      ))}

      {/* 多選變換控制器 */}
      {!isPreview && selectedZoneIds.length > 1 && (
        <MultiSelectTransform 
          selectedZoneIds={selectedZoneIds}
          onTransformStart={() => setIsTransforming(true)}
          onTransformEnd={() => setIsTransforming(false)}
        />
      )}
      </Canvas>
    </>
  );
};
