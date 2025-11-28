import { useEditorStore } from '../store/editorStore';

export const EnvironmentControls = () => {
  const environment = useEditorStore((state) => state.environment);
  const updateEnvironment = useEditorStore((state) => state.updateEnvironment);
  const resetEnvironment = useEditorStore((state) => state.resetEnvironment);

  return (
    <div>
      <h3>環境控制</h3>

      {/* 霧氣控制 */}
      <div className="slider-group">
        <label>霧氣</label>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={environment.fog.enabled}
            onChange={(e) => updateEnvironment({
              fog: { ...environment.fog, enabled: e.target.checked }
            })}
            id="fog-enabled"
          />
          <label htmlFor="fog-enabled" style={{ marginLeft: '8px', fontWeight: 'normal' }}>
            啟用霧效
          </label>
        </div>
        
        {environment.fog.enabled && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '13px' }}>近距離</label>
              <input
                type="range"
                min="1"
                max="50"
                value={environment.fog.near}
                onChange={(e) => updateEnvironment({
                  fog: { ...environment.fog, near: Number(e.target.value) }
                })}
              />
              <div className="slider-value">{environment.fog.near}</div>
            </div>

            <div>
              <label style={{ fontSize: '13px' }}>遠距離</label>
              <input
                type="range"
                min="50"
                max="200"
                value={environment.fog.far}
                onChange={(e) => updateEnvironment({
                  fog: { ...environment.fog, far: Number(e.target.value) }
                })}
              />
              <div className="slider-value">{environment.fog.far}</div>
            </div>
          </>
        )}
      </div>

      {/* 攝影機控制 */}
      <div className="slider-group">
        <label>攝影機視野角度 (FOV)</label>
        <input
          type="range"
          min="30"
          max="120"
          value={environment.camera.fov}
          onChange={(e) => updateEnvironment({
            camera: { ...environment.camera, fov: Number(e.target.value) }
          })}
        />
        <div className="slider-value">{environment.camera.fov}°</div>
      </div>

      {/* 地面控制 */}
      <div className="slider-group">
        <label>地面大小</label>
        <input
          type="range"
          min="50"
          max="500"
          step="10"
          value={environment.ground.size}
          onChange={(e) => updateEnvironment({
            ground: { ...environment.ground, size: Number(e.target.value) }
          })}
        />
        <div className="slider-value">{environment.ground.size}</div>
      </div>

      <div className="slider-group">
        <label>網格分割數</label>
        <input
          type="range"
          min="10"
          max="50"
          value={environment.ground.divisions}
          onChange={(e) => updateEnvironment({
            ground: { ...environment.ground, divisions: Number(e.target.value) }
          })}
        />
        <div className="slider-value">{environment.ground.divisions}</div>
      </div>

      {/* 重置按鈕 */}
      <button
        onClick={resetEnvironment}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '20px',
          backgroundColor: '#95a5a6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        重置設定
      </button>
    </div>
  );
};
