import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 創建一個全局狀態來共享相機
let globalCamera: THREE.Camera | null = null;

export const SelectionBoxHelper = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    globalCamera = camera;
    return () => {
      globalCamera = null;
    };
  }, [camera]);

  return null;
};

export const SelectionBoxOverlay = () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const zones = useEditorStore((state) => state.zones);
  const selectMultipleZones = useEditorStore((state) => state.selectMultipleZones);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // 只在按住 Shift 時啟用框選
      if (!e.shiftKey) return;
      
      // 檢查是否點擊在 canvas 上
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom
      ) {
        return;
      }
      
      e.preventDefault();
      setStartPos({ x: e.clientX, y: e.clientY });
      setCurrentPos({ x: e.clientX, y: e.clientY });
      setIsSelecting(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;
      e.preventDefault();
      setCurrentPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isSelecting) return;
      e.preventDefault();

      // 計算選擇框範圍
      const minX = Math.min(startPos.x, currentPos.x);
      const maxX = Math.max(startPos.x, currentPos.x);
      const minY = Math.min(startPos.y, currentPos.y);
      const maxY = Math.max(startPos.y, currentPos.y);

      // 獲取 canvas 元素
      const canvas = document.querySelector('canvas');
      if (!canvas || !globalCamera) {
        setIsSelecting(false);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const selectedIds: string[] = [];
      
      // 使用 Three.js 投影來檢查物體是否在選擇框內
      if (globalCamera) {
        zones.forEach((zone) => {
          const worldPos = new THREE.Vector3(
            zone.position[0],
            zone.position[1],
            zone.position[2]
          );
          
          // 將 3D 世界坐標轉換為屏幕坐標
          const screenPos = worldPos.clone().project(globalCamera!);
          
          // 轉換為像素坐標
          const x = (screenPos.x * 0.5 + 0.5) * rect.width + rect.left;
          const y = (-(screenPos.y) * 0.5 + 0.5) * rect.height + rect.top;

          // 檢查是否在選擇框內
          if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            selectedIds.push(zone.id);
          }
        });
      }

      if (selectedIds.length > 0) {
        selectMultipleZones(selectedIds);
      }

      setIsSelecting(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, startPos, currentPos, zones, selectMultipleZones]);

  if (!isSelecting) return null;

  const left = Math.min(startPos.x, currentPos.x);
  const top = Math.min(startPos.y, currentPos.y);
  const width = Math.abs(currentPos.x - startPos.x);
  const height = Math.abs(currentPos.y - startPos.y);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px dashed #3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        pointerEvents: 'none',
        zIndex: 10000
      }}
    />
  );
};
