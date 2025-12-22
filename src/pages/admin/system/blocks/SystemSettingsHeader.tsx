import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/services';

const SystemSettingsHeader = () => {
  const { refetch, isLoading } = useSettings();

  const handleRefresh = () => {
    refetch();
  };

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
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 me-2"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <KeenIcon icon="refresh" className="me-2" />
                  Refresh Status
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SystemSettingsHeader };


