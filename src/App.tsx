import { useEditorStore } from './store/editorStore';
import { Canvas3D } from './components/Canvas3D';
import { Toolbar } from './components/Toolbar';
import { ZoneList } from './components/ZoneList';
import { PropertyEditor } from './components/PropertyEditor';
import { EnvironmentControls } from './components/EnvironmentControls';
import { HelpPanel } from './components/HelpPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { SelectionBoxOverlay } from './components/SelectionBoxOverlay';
import './App.css';

function App() {
  const mode = useEditorStore((state) => state.mode);

  return (
    <div className="app">
      <Toolbar />
      {mode === 'edit' && <SelectionBoxOverlay />}

      <div className="main-content">
        {mode === 'edit' ? (
          <>
            <div className="sidebar">
              <h3>區域列表</h3>
              <ZoneList />
            </div>

            <div className="canvas-container">
              <Canvas3D />
              <SettingsPanel />
              <HelpPanel />
            </div>

            <div className="property-panel">
              <PropertyEditor />
            </div>
          </>
        ) : (
          <>
            <div className="canvas-container">
              <Canvas3D isPreview={true} />
            </div>

            <div className="preview-controls">
              <EnvironmentControls />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
