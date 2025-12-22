import { SystemSettingsHeader } from './blocks/SystemSettingsHeader';
import { IntegrationTiles } from './blocks/IntegrationTiles';
import { SystemLogs } from './blocks/SystemLogs';

const SystemSettingsContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header */}
      <SystemSettingsHeader />

      {/* Integration Tiles */}
      <IntegrationTiles />

      {/* System Logs */}
      <SystemLogs />
    </div>
  );
};

export { SystemSettingsContent };


