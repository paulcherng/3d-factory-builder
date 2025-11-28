# 需求文件

## 簡介

本系統為一個基於網頁的 3D 工廠佈局編輯器，允許使用者透過視覺化介面創建、編輯和預覽工廠建築物的 3D 佈局。系統使用 React Three Fiber 進行 3D 渲染，並提供直觀的拖放介面來配置建築物的位置和尺寸。最終輸出為結構化的 JavaScript 資料格式，可直接用於 3D 場景渲染。

## 術語表

- **編輯器 (Editor)**: 允許使用者創建和修改 3D 物件的主要介面
- **區域 (Zone)**: 代表工廠中單一建築物或區域的 3D 長方體物件
- **校園 (Campus)**: 包含所有區域的 3D 場景空間
- **吸附 (Snap)**: 當拖動物件時自動對齊到網格座標的功能
- **預覽器 (Previewer)**: 顯示最終 3D 場景的視覺化元件
- **區域類型 (ZoneType)**: 區域的分類（如 ADMIN、UTILITY、BUILDING）

## 需求

### 需求 1

**使用者故事:** 作為工廠規劃人員，我想要新增 3D 建築物到校園中，以便建立工廠佈局

#### 驗收標準

1. WHEN 使用者點擊新增按鈕 THEN 編輯器 SHALL 在校園中創建一個新的區域物件
2. WHEN 創建新區域 THEN 編輯器 SHALL 為該區域分配唯一的識別碼
3. WHEN 創建新區域 THEN 編輯器 SHALL 設定預設的位置、尺寸和類型屬性
4. WHEN 多個區域被創建 THEN 編輯器 SHALL 在同一個校園空間中顯示所有區域
5. WHEN 區域被創建 THEN 編輯器 SHALL 允許使用者輸入區域的名稱和描述

### 需求 2

**使用者故事:** 作為工廠規劃人員，我想要拖動建築物來調整位置，以便優化工廠佈局

#### 驗收標準

1. WHEN 使用者拖動區域物件 THEN 編輯器 SHALL 即時更新該區域在 3D 空間中的位置
2. WHILE 使用者拖動區域 THEN 編輯器 SHALL 啟用吸附功能將位置對齊到網格座標
3. WHEN 區域位置更新 THEN 編輯器 SHALL 更新該區域的 position 屬性值
4. WHEN 拖動操作完成 THEN 編輯器 SHALL 保存新的位置座標
5. WHILE 拖動進行中 THEN 編輯器 SHALL 提供視覺回饋顯示當前位置

### 需求 3

**使用者故事:** 作為工廠規劃人員，我想要設定建築物的長寬高，以便準確表示實際尺寸

#### 驗收標準

1. WHEN 使用者選擇一個區域 THEN 編輯器 SHALL 顯示該區域的尺寸屬性編輯介面
2. WHEN 使用者修改長度值 THEN 編輯器 SHALL 更新區域的 X 軸尺寸並即時渲染
3. WHEN 使用者修改寬度值 THEN 編輯器 SHALL 更新區域的 Z 軸尺寸並即時渲染
4. WHEN 使用者修改高度值 THEN 編輯器 SHALL 更新區域的 Y 軸尺寸並即時渲染
5. WHEN 尺寸值被修改 THEN 編輯器 SHALL 驗證輸入為正數值

### 需求 4

**使用者故事:** 作為工廠規劃人員，我想要設定建築物的類型和屬性，以便分類不同功能的區域

#### 驗收標準

1. WHEN 使用者選擇一個區域 THEN 編輯器 SHALL 顯示區域類型選擇介面
2. WHEN 使用者選擇區域類型 THEN 編輯器 SHALL 更新該區域的 type 屬性
3. WHEN 區域類型改變 THEN 編輯器 SHALL 保持該區域的其他屬性不變
4. WHEN 使用者輸入區域名稱 THEN 編輯器 SHALL 更新該區域的 name 屬性
5. WHEN 使用者輸入區域描述 THEN 編輯器 SHALL 更新該區域的 description 屬性

### 需求 5

**使用者故事:** 作為工廠規劃人員，我想要將佈局匯出為資料結構，以便在 React Three Fiber 應用中使用

#### 驗收標準

1. WHEN 使用者點擊匯出按鈕 THEN 編輯器 SHALL 生成包含所有區域的 JavaScript 陣列結構
2. WHEN 生成匯出資料 THEN 編輯器 SHALL 包含每個區域的 id、name、type、position、dimensions 和 description 欄位
3. WHEN 生成匯出資料 THEN 編輯器 SHALL 將 position 格式化為三元素陣列 [x, y, z]
4. WHEN 生成匯出資料 THEN 編輯器 SHALL 將 dimensions 格式化為三元素陣列 [width, height, depth]
5. WHEN 匯出完成 THEN 編輯器 SHALL 提供複製或下載資料的選項

### 需求 6

**使用者故事:** 作為工廠規劃人員，我想要預覽 3D 場景，以便查看最終渲染效果

#### 驗收標準

1. WHEN 使用者切換到預覽模式 THEN 預覽器 SHALL 使用 React Three Fiber 渲染完整的 3D 場景
2. WHEN 預覽場景渲染 THEN 預覽器 SHALL 顯示所有已創建的區域物件
3. WHEN 在預覽模式中 THEN 預覽器 SHALL 允許使用者使用滑鼠控制攝影機視角
4. WHEN 預覽場景渲染 THEN 預覽器 SHALL 顯示地面網格作為參考
5. WHEN 區域資料更新 THEN 預覽器 SHALL 即時反映變更

### 需求 7

**使用者故事:** 作為工廠規劃人員，我想要調整預覽環境設定，以便獲得最佳視覺效果

#### 驗收標準

1. WHEN 使用者調整霧氣範圍滑桿 THEN 預覽器 SHALL 更新場景霧效的起始和結束距離
2. WHEN 使用者修改攝影機設定 THEN 預覽器 SHALL 更新攝影機的位置、視野角度或其他參數
3. WHEN 使用者調整地面範圍 THEN 預覽器 SHALL 更新地面網格的大小
4. WHEN 環境設定改變 THEN 預覽器 SHALL 即時應用新設定到 3D 場景
5. WHEN 使用者重置環境設定 THEN 預覽器 SHALL 恢復所有參數到預設值

### 需求 8

**使用者故事:** 作為工廠規劃人員，我想要刪除和編輯現有區域，以便修正錯誤或調整佈局

#### 驗收標準

1. WHEN 使用者選擇一個區域並點擊刪除 THEN 編輯器 SHALL 從校園中移除該區域
2. WHEN 區域被刪除 THEN 編輯器 SHALL 更新場景移除該區域的視覺表示
3. WHEN 使用者選擇一個區域 THEN 編輯器 SHALL 顯示該區域的所有可編輯屬性
4. WHEN 區域屬性被修改 THEN 編輯器 SHALL 驗證新值的有效性
5. WHEN 無效值被輸入 THEN 編輯器 SHALL 顯示錯誤訊息並保持原有值

### 需求 9

**使用者故事:** 作為工廠規劃人員，我想要載入已存在的佈局資料，以便繼續編輯先前的工作

#### 驗收標準

1. WHEN 使用者提供 FACTORY_ZONES 格式的資料 THEN 編輯器 SHALL 解析該資料結構
2. WHEN 資料被解析 THEN 編輯器 SHALL 為每個區域物件創建對應的 3D 物件
3. WHEN 載入區域資料 THEN 編輯器 SHALL 驗證所有必要欄位的存在性
4. WHEN 資料格式無效 THEN 編輯器 SHALL 顯示錯誤訊息並拒絕載入
5. WHEN 載入完成 THEN 編輯器 SHALL 在校園中顯示所有載入的區域
