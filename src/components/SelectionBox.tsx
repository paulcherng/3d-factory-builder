import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector2, Vector3 } from 'three';
import { useEditorStore } from '../store/editorStore';

export const SelectionBox = () => {
  const { camera, gl } = useThree();
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<Vector2 | null>(null);
  const [endPoint, setEndPoint] = useState<Vector2 | null>(null);
  const selectMultipleZones = useEditorStore((state) => state.selectMultipleZones);
  const zones = useEditorStore((state) => state.zones);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      // 只在按住 Shift 時啟用框選
      if (!e.shiftKey) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      setStartPoint(new Vector2(x, y));
      setIsSelecting(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting || !startPoint) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      setEndPoint(new Vector2(x, y));
    };

    const handleMouseUp = () => {
      if (!isSelecting || !startPoint || !endPoint) {
        setIsSelecting(false);
        setStartPoint(null);
        setEndPoint(null);
        return;
      }

      // 計算選擇框內的物件
      const selectedIds: string[] = [];

      // 創建選擇框的邊界
      const minX = Math.min(startPoint.x, endPoint.x);
      const maxX = Math.max(startPoint.x, endPoint.x);
      const minY = Math.min(startPoint.y, endPoint.y);
      const maxY = Math.max(startPoint.y, endPoint.y);

      // 檢查每個區域是否在選擇框內
      zones.forEach((zone) => {
        const position = new Vector3(...zone.position);
        const projected = position.project(camera);

        if (
          projected.x >= minX &&
          projected.x <= maxX &&
          projected.y >= minY &&
          projected.y <= maxY
        ) {
          selectedIds.push(zone.id);
        }
      });

      if (selectedIds.length > 0) {
        selectMultipleZones(selectedIds);
      }

      setIsSelecting(false);
      setStartPoint(null);
      setEndPoint(null);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, startPoint, endPoint, camera, gl, zones, selectMultipleZones]);

  // 渲染選擇框
  if (!isSelecting || !startPoint || !endPoint) return null;

  const rect = gl.domElement.getBoundingClientRect();
  const left = Math.min(
    ((startPoint.x + 1) / 2) * rect.width,
    ((endPoint.x + 1) / 2) * rect.width
  );
  const top = Math.min(
    ((1 - startPoint.y) / 2) * rect.height,
    ((1 - endPoint.y) / 2) * rect.height
  );
  const width = Math.abs(((endPoint.x - startPoint.x) / 2) * rect.width);
  const height = Math.abs(((endPoint.y - startPoint.y) / 2) * rect.height);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px dashed #3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    />
  );
};
