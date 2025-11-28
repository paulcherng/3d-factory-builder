import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';

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
      
      setStartPos({ x: e.clientX, y: e.clientY });
      setCurrentPos({ x: e.clientX, y: e.clientY });
      setIsSelecting(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;
      setCurrentPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (!isSelecting) return;

      // 計算選擇框範圍
      const minX = Math.min(startPos.x, currentPos.x);
      const maxX = Math.max(startPos.x, currentPos.x);
      const minY = Math.min(startPos.y, currentPos.y);
      const maxY = Math.max(startPos.y, currentPos.y);

      // 獲取 canvas 元素來進行投影計算
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        setIsSelecting(false);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      
      // 簡單的選擇邏輯：檢查物體中心點是否在框內
      const selectedIds: string[] = [];
      
      zones.forEach((zone) => {
        // 將 3D 位置轉換為屏幕坐標（簡化版本）
        // 這裡我們假設物體在框內如果其位置在範圍內
        const screenX = rect.left + (zone.position[0] + 100) * (rect.width / 200);
        const screenY = rect.top + (100 - zone.position[2]) * (rect.height / 200);

        if (screenX >= minX && screenX <= maxX && screenY >= minY && screenY <= maxY) {
          selectedIds.push(zone.id);
        }
      });

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
