import { useEditorStore } from '../store/editorStore';

export const ZoneList = () => {
  const zones = useEditorStore((state) => state.zones);
  const selectedZoneIds = useEditorStore((state) => state.selectedZoneIds);
  const selectZone = useEditorStore((state) => state.selectZone);

  if (zones.length === 0) {
    return (
      <div className="empty-state">
        <p>尚無區域</p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>點擊「新增區域」開始</p>
      </div>
    );
  }

  const handleZoneClick = (zoneId: string, e: React.MouseEvent) => {
    const multiSelect = e.ctrlKey || e.metaKey;
    selectZone(zoneId, multiSelect);
  };

  return (
    <ul className="zone-list">
      {zones.map((zone) => (
        <li
          key={zone.id}
          className={`zone-item ${selectedZoneIds.includes(zone.id) ? 'selected' : ''}`}
          onClick={(e) => handleZoneClick(zone.id, e)}
        >
          <div className="zone-item-name">{zone.name}</div>
          <div className="zone-item-type">{zone.type}</div>
        </li>
      ))}
    </ul>
  );
};
