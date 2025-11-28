# 3D 工廠編輯器 - 問題修復 V7

## 修復的問題

### 1. ✅ 多選移動和縮放功能修復

**問題描述**：
- 多選物件後移動和縮放會有異常行為
- 物件位置不正確更新
- 縮放後物件位置錯誤

**根本原因**：
1. 中心點計算時機不正確，在變換過程中被重新計算
2. 變換狀態管理不當，導致 useEffect 在不該觸發時觸發
3. 批量更新邏輯不夠健壯

**解決方案**：

#### 1.1 添加變換狀態標記
```typescript
const isTransforming = useRef(false);

// 在變換開始時設置
const handleTransformStart = () => {
  isTransforming.current = true;
  // ...
};

// 在變換結束時重置
const handleTransformEnd = () => {
  isTransforming.current = false;
  // ...
};
```

#### 1.2 優化中心點計算
```typescript
// 只在非變換狀態下重新計算中心點
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
```

#### 1.3 改進批量更新邏輯
```typescript
const handleTransformChange = () => {
  if (!groupRef.current || !isTransforming.current) return;

  if (transformMode === 'translate') {
    // 計算位移
    const offset = groupRef.current.position.clone().sub(centerPosition.current);
    
    // 批量收集更新
    const updates: Array<{ id: string; position: [number, number, number] }> = [];
    selectedZones.forEach(zone => {
      const initialPos = initialPositions.current.get(zone.id);
      if (initialPos) {
        updates.push({
          id: zone.id,
          position: [
            initialPos[0] + offset.x,
            initialPos[1] + offset.y,
            initialPos[2] + offset.z
          ]
        });
      }
    });
    
    // 執行批量更新
    updates.forEach(({ id, position }) => {
      updateZone(id, { position });
    });
  }
  // ... 縮放邏輯類似
};
```

#### 1.4 變換結束後重新計算中心
```typescript
const handleTransformEnd = () => {
  if (!groupRef.current) return;
  
  isTransforming.current = false;
  
  if (transformMode === 'scale') {
    groupRef.current.scale.set(1, 1, 1);
  }
  
  // 重新計算中心位置
  const center = new Vector3();
  selectedZones.forEach(zone => {
    center.add(new Vector3(...zone.position));
  });
  center.divideScalar(selectedZones.length);
  centerPosition.current.copy(center);
  groupRef.current.position.copy(center);
};
```

#### 1.5 添加視覺輔助
- 在多選中心點顯示黃色半透明球體
- 顯示所有選中物件的邊界框
- 幫助用戶理解變換的中心點和範圍

```typescript
// 中心點標記
<mesh>
  <sphereGeometry args={[0.3, 16, 16]} />
  <meshBasicMaterial color="#ffff00" transparent opacity={0.5} />
</mesh>

// 邊界框
<group position={boundingBoxCenter}>
  <lineSegments>
    <edgesGeometry args={[new THREE.BoxGeometry(...)]} />
    <lineBasicMaterial color="#ffff00" linewidth={2} transparent opacity={0.5} />
  </lineSegments>
</group>
```

### 2. ✅ 雙軸移動功能說明

**功能說明**：
TransformControls 本身已經支持雙軸（平面）移動功能，無需額外實現。

**使用方法**：
1. 選擇物件進入移動模式
2. 點擊並拖曳軸線 → 單軸移動（X、Y 或 Z）
3. 點擊並拖曳平面 → 雙軸移動（XY、XZ 或 YZ）

**視覺提示**：
- 紅色箭頭：X 軸
- 綠色箭頭：Y 軸
- 藍色箭頭：Z 軸
- 紅綠平面：XY 平面移動
- 紅藍平面：XZ 平面移動
- 綠藍平面：YZ 平面移動

**確保功能正常的設置**：
```typescript
<TransformControls
  mode="translate"
  showX={true}  // 顯示 X 軸控制
  showY={true}  // 顯示 Y 軸控制
  showZ={true}  // 顯示 Z 軸控制
  // 這些設置會自動啟用平面移動
/>
```

## 技術實現細節

### 狀態管理優化

**問題**：useEffect 依賴項導致不必要的重新計算

**解決**：
```typescript
// 使用字符串化的位置作為依賴，避免數組引用變化
[selectedZones.map(z => `${z.position.join(',')}`).join('|')]
```

### 變換邏輯優化

**移動邏輯**：
1. 記錄初始位置
2. 計算當前位移 = 當前位置 - 初始中心位置
3. 新位置 = 初始位置 + 位移

**縮放邏輯**：
1. 記錄初始位置和尺寸
2. 計算相對位置 = 初始位置 - 中心位置
3. 縮放相對位置 = 相對位置 × 縮放比例
4. 新位置 = 中心位置 + 縮放後的相對位置
5. 新尺寸 = 初始尺寸 × 縮放比例（最小 0.1）

### 視覺反饋

**多選指示器**：
- 黃色半透明球體標記中心點
- 黃色邊界框顯示選擇範圍
- 變換控制器顯示在中心點

**邊界框計算**：
```typescript
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
```

## 測試指南

### 測試多選移動

1. **基本移動測試**：
   - 選擇 2-3 個物件
   - 使用 X/Y/Z 軸箭頭移動
   - ✅ 驗證：所有物件保持相對位置一起移動

2. **雙軸移動測試**：
   - 選擇多個物件
   - 點擊並拖曳平面（XY、XZ 或 YZ）
   - ✅ 驗證：物件在對應平面上移動

3. **網格吸附測試**：
   - 啟用網格吸附
   - 移動多個物件
   - ✅ 驗證：移動結束後位置對齊網格

### 測試多選縮放

1. **均勻縮放測試**：
   - 選擇多個物件
   - 切換到縮放模式
   - 拖曳中心的白色立方體進行均勻縮放
   - ✅ 驗證：所有物件相對於中心點縮放

2. **單軸縮放測試**：
   - 選擇多個物件
   - 拖曳 X/Y/Z 軸進行單軸縮放
   - ✅ 驗證：物件在對應軸向縮放

3. **最小尺寸限制**：
   - 嘗試將物件縮放到很小
   - ✅ 驗證：尺寸不會小於 0.1

### 測試視覺反饋

1. **中心點標記**：
   - 選擇多個物件
   - ✅ 驗證：看到黃色半透明球體在中心

2. **邊界框**：
   - 選擇多個物件
   - ✅ 驗證：看到黃色邊界框包圍所有物件

3. **變換控制器**：
   - 選擇多個物件
   - ✅ 驗證：變換控制器顯示在中心點
   - ✅ 驗證：單個物件的控制器被隱藏

## 已知限制

1. **縮放中心**：縮放始終相對於選擇的中心點，無法選擇其他縮放中心
2. **旋轉功能**：目前不支持多選旋轉
3. **性能**：選擇大量物件（>50）時可能有性能影響

## 後續改進建議

1. **縮放選項**：
   - 添加「保持位置縮放」選項（只改變尺寸，不改變位置）
   - 添加「相對於原點縮放」選項

2. **旋轉支持**：
   - 實現多選旋轉功能
   - 相對於中心點旋轉所有物件

3. **性能優化**：
   - 使用批量更新 API 減少渲染次數
   - 對大量物件使用 LOD（細節層次）

4. **視覺增強**：
   - 添加物件數量顯示
   - 顯示總體積/總重量等統計信息
   - 可配置的邊界框顏色和樣式
