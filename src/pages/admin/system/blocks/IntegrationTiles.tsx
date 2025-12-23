import { useState, useMemo } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings, useUpdateSettings, useTestIntegration } from '@/services';
import { format } from 'date-fns';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

interface IIntegration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTested: string | null;
  apiKey: string | null;
  description: string;
  icon: string;
  webhookUrl?: string | null;
  environment?: string;
}

const IntegrationTiles = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IIntegration | null>(null);
  const [configData, setConfigData] = useState<{
    apiKey: string;
    webhookUrl: string;
    environment: string;
  }>({
    apiKey: '',
    webhookUrl: '',
    environment: 'production'
  });

  const { data: settings, isLoading, isError, error, refetch } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const testIntegrationMutation = useTestIntegration();
  const [testingIntegrationId, setTestingIntegrationId] = useState<string | null>(null);

  const getMaskedApiKey = (apiKey: string | null) => {
    if (!apiKey) {
      return 'your****';
    }
    return apiKey;
  };



  // Map API data to integration tiles
  const integrations: IIntegration[] = useMemo(() => {
    if (!settings?.integrations) return [];

    const integrationMap = {
      otp_service: {
        id: 'otp-service',
        name: 'OTP Service',
        description: 'SMS and OTP delivery service',
        // icon: 'smartphone'
        icon: 'phone'
      },
      payment_gateway: {
        id: 'payment-gateway',
        name: 'Payment Gateway',
        description: 'Payment processing and transactions',
        // icon: 'money-bill'
        icon: 'dollar'
      },
      payout_service: {
        id: 'payout-service',
        name: 'Payout Service',
        description: 'Provider payouts and settlements',
        // icon: 'wallet'
        icon: 'wallet'
      },
      maps_api: {
        id: 'maps-api',
        name: 'Maps API',
        description: 'Location services and mapping',
        // icon: 'location'
        icon: 'geolocation'
      }
    };

    return Object.entries(settings.integrations).map(([key, value]) => {
      const meta = integrationMap[key as keyof typeof integrationMap];
      if (!meta) return null;

      return {
        ...meta,
        type: value.provider || 'Unknown',
        status: value.status || 'disconnected',
        lastTested: value.last_tested ? format(new Date(value.last_tested), 'yyyy-MM-dd hh:mm a') : null,
        apiKey: value.api_key,
        webhookUrl: value.webhook_url,
        environment: value.environment || 'production'
      };
    }).filter(Boolean) as IIntegration[];
  }, [settings]);

  const handleTestConnection = async (integrationId: string) => {
    const integrationType = integrationId.replace('-', '_') as 'otp_service' | 'payment_gateway' | 'payout_service' | 'maps_api';
    try {
      setTestingIntegrationId(integrationId);
      await testIntegrationMutation.mutateAsync(integrationType);
      refetch();
    } catch (error) {
      console.error('Error testing integration:', error);
    }
    finally {
      setTestingIntegrationId(null);
    }
  };

  const handleConfigure = (integration: IIntegration) => {
    setSelectedIntegration(integration);
    setConfigData({
      apiKey: integration.apiKey || '',
      webhookUrl: integration.webhookUrl || '',
      environment: integration.environment || 'production'
    });
    setIsConfigOpen(true);
  };

  const handleSaveConfiguration = async () => {
    if (!selectedIntegration) return;

    const integrationType = selectedIntegration.id.replace('-', '_') as 'otp_service' | 'payment_gateway' | 'payout_service' | 'maps_api';

    try {
      await updateSettingsMutation.mutateAsync({
        integrations: {
          [integrationType]: {
            api_key: configData.apiKey || undefined,
            webhook_url: configData.webhookUrl || undefined,
            environment: configData.environment
          }
        }
      });
      setIsConfigOpen(false);
      setSelectedIntegration(null);
      refetch();
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { variant: 'success', text: 'Connected' },
      disconnected: { variant: 'destructive', text: 'Disconnected' },
      error: { variant: 'destructive', text: 'Error' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const iconConfig = {
      connected: 'check-circle',
      disconnected: 'cross-circle',
      error: 'danger'
    };

    return iconConfig[status as keyof typeof iconConfig] || 'question';
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <ContentLoader />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="danger">
        <div className="flex items-center justify-between">
          <span>
            {error instanceof Error ? error.message : 'Failed to load integrations. Please try again.'}
          </span>
          <button
            onClick={() => refetch()}
            className="text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Integration Status Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {integrations.map((integration) => (
          <div key={integration.id} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${integration.status === 'connected' ? 'bg-success-light text-success' :
                    integration.status === 'error' ? 'bg-danger-light text-danger' :
                      'bg-warning-light text-warning'
                    }`}>
                    <KeenIcon icon={integration.icon} className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-600">{integration.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* <KeenIcon icon={getStatusIcon(integration.status)} className="text-lg" /> */}
                  {getStatusBadge(integration.status)}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-sm">{integration.description}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">API Key</p>
                  <div className="flex items-center gap-2">
                    {/* <code className="text-xs bg-gray-100 px-2 py-1 rounded">{integration.apiKey}</code> */}
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {getMaskedApiKey(integration.apiKey)}
                    </code>

                    <Button size="sm" variant="ghost">
                      <KeenIcon icon="eye" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Tested</p>
                  <p className="text-sm">{integration.lastTested || 'Never tested'}</p>
                </div>

                <div className="flex gap-2 pt-3">
                  {/* <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleTestConnection(integration.id)}
                    className="flex-1"
                    disabled={testIntegrationMutation.isLoading}
                  >
                    {testIntegrationMutation.isLoading ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 me-1"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <KeenIcon icon="refresh" className="me-1" />
                        Test
                      </>
                    )}
                  </Button> */}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestConnection(integration.id)}
                    className="flex-1"
                    disabled={testingIntegrationId === integration.id}
                  >
                    {testingIntegrationId === integration.id ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 me-1"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <KeenIcon icon="refresh" className="me-1" />
                        Test
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleConfigure(integration)}
                    className="flex-1"
                  >
                    <KeenIcon icon="setting-2" className="me-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="setting-2" className="text-primary" />
              Configure {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-6">
              {updateSettingsMutation.isError && (
                <Alert variant="danger">
                  {updateSettingsMutation.error instanceof Error
                    ? updateSettingsMutation.error.message
                    : 'An error occurred while saving configuration'}
                </Alert>
              )}

              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={configData.apiKey}
                  onChange={(e) => setConfigData(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="mt-2"
                  placeholder="Enter API key..."
                />
              </div>

              <div>
                <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
                <Input
                  id="webhook-url"
                  value={configData.webhookUrl}
                  onChange={(e) => setConfigData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  className="mt-2"
                  placeholder="https://your-domain.com/webhook"
                />
              </div>

              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={configData.environment}
                  onValueChange={(value) => setConfigData(prev => ({ ...prev, environment: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsConfigOpen(false)}
                  disabled={updateSettingsMutation.isLoading}
                >
                  <KeenIcon icon="cross" className="me-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveConfiguration}
                  disabled={updateSettingsMutation.isLoading}
                >
                  {updateSettingsMutation.isLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="check" className="me-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { IntegrationTiles };


