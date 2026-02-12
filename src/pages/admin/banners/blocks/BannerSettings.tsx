import { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBannerSettings, useUpdateBannerSettings, useBanners, useSubBanners } from '@/services';
import { Alert } from '@/components/alert';

const BannerSettings = () => {
  const { data: settings, isLoading, isError, error, refetch } = useBannerSettings();
  // Fetch with limit 1 to efficiently get total count from pagination
  const { pagination: bannerPagination } = useBanners({ page: 1, limit: 1 });
  const { pagination: subBannerPagination } = useSubBanners({ page: 1, limit: 1 });
  
  const updateSettings = useUpdateBannerSettings({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Failed to update banner settings:', error);
      alert(error.message || 'Failed to update banner settings');
    }
  });

  const [localSettings, setLocalSettings] = useState({
    banner_show: true,
    sub_banner_show: true
  });
  
  // Get counts from pagination total
  const bannerCount = bannerPagination?.total ?? 0;
  const subBannerCount = subBannerPagination?.total ?? 0;

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        banner_show: settings.banner_show,
        sub_banner_show: settings.sub_banner_show
      });
    }
  }, [settings]);

  const handleToggle = (field: 'banner_show' | 'sub_banner_show', value: boolean) => {
    const newSettings = {
      ...localSettings,
      [field]: value
    };
    setLocalSettings(newSettings);
    
    // Update immediately
    updateSettings.mutate(newSettings);
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card">
        <div className="card-body">
          <Alert variant="danger">
            <div className="flex items-center justify-between">
              <span>
                {error?.message || 'Failed to load banner settings. Please try again.'}
              </span>
              <button
                onClick={() => refetch()}
                className="text-sm underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <KeenIcon icon="setting" className="text-primary text-2xl" />
          <div>
            <h3 className="card-title">Banner Display Settings</h3>
            <p className="text-sm text-gray-600">Control which banners are shown on the user dashboard</p>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="space-y-6">
          {/* Banner Show/Hide Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1 flex items-center gap-3">
              <Switch
                id="banner_show"
                checked={localSettings.banner_show}
                onCheckedChange={(checked) => handleToggle('banner_show', checked)}
                disabled={updateSettings.isLoading}
              />
              <div className="flex-1">
                <Label htmlFor="banner_show" className="text-base font-medium text-gray-900 cursor-pointer">
                  Banner ({bannerCount})
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {localSettings.banner_show 
                    ? 'Banners are currently visible on the user dashboard' 
                    : 'Banners are currently hidden from the user dashboard'}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Banner Show/Hide Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1 flex items-center gap-3">
              <Switch
                id="sub_banner_show"
                checked={localSettings.sub_banner_show}
                onCheckedChange={(checked) => handleToggle('sub_banner_show', checked)}
                disabled={updateSettings.isLoading}
              />
              <div className="flex-1">
                <Label htmlFor="sub_banner_show" className="text-base font-medium text-gray-900 cursor-pointer">
                  Sub-Banner ({subBannerCount})
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {localSettings.sub_banner_show 
                    ? 'Sub-banners are currently visible on the user dashboard' 
                    : 'Sub-banners are currently hidden from the user dashboard'}
                </p>
              </div>
            </div>
          </div>

          {updateSettings.isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Updating settings...
            </div>
          )}

          {updateSettings.isError && (
            <Alert variant="danger">
              <p className="text-sm">
                {updateSettings.error?.message || 'Failed to update settings. Please try again.'}
              </p>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export { BannerSettings };
