// 對齊單一座標值到網格
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// 對齊 3D 位置到網格
export const snapPositionToGrid = (
  position: [number, number, number],
  gridSize: number
): [number, number, number] => {
  return [
    snapToGrid(position[0], gridSize),
    position[1], // Y 軸通常不吸附（高度）
    snapToGrid(position[2], gridSize)
  ];
};
