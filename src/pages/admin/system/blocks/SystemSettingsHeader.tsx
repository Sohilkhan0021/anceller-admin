import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';

const SystemSettingsHeader = () => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="setting-2" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">System Settings & Integrations</h1>
              <p className="text-sm text-gray-600">Configure and monitor platform-wide integrations</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="refresh" className="me-2" />
              Refresh Status
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="setting-2" className="me-2" />
              Configure All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SystemSettingsHeader };


