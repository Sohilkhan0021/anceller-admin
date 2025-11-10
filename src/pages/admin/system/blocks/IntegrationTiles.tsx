import { useState } from 'react';
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
} from '@/components/ui/dialog';

interface IIntegration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTested: string;
  apiKey: string;
  description: string;
  icon: string;
}

const IntegrationTiles = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IIntegration | null>(null);

  // Mock data - in real app, this would come from API
  const integrations: IIntegration[] = [
    {
      id: 'otp-service',
      name: 'OTP Service',
      type: 'Twilio',
      status: 'connected',
      lastTested: '2024-01-20 10:30 AM',
      apiKey: 'tw_****_****_****_1234',
      description: 'SMS and OTP delivery service',
      icon: 'smartphone'
    },
    {
      id: 'payment-gateway',
      name: 'Payment Gateway',
      type: 'Razorpay',
      status: 'connected',
      lastTested: '2024-01-20 10:25 AM',
      apiKey: 'rzp_****_****_****_5678',
      description: 'Payment processing and transactions',
      icon: 'money-bill'
    },
    {
      id: 'payout-service',
      name: 'Payout Service',
      type: 'RazorpayX',
      status: 'connected',
      lastTested: '2024-01-20 10:20 AM',
      apiKey: 'rzpx_****_****_****_9012',
      description: 'Provider payouts and settlements',
      icon: 'wallet'
    },
    {
      id: 'maps-api',
      name: 'Maps API',
      type: 'Google Maps',
      status: 'error',
      lastTested: '2024-01-20 09:45 AM',
      apiKey: 'AIza****_****_****_3456',
      description: 'Location services and mapping',
      icon: 'location'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      type: 'FCM + SES',
      status: 'connected',
      lastTested: '2024-01-20 10:15 AM',
      apiKey: 'fcm_****_****_****_7890',
      description: 'Push notifications and email delivery',
      icon: 'notification'
    }
  ];

  const handleTestConnection = (integrationId: string) => {
    // TODO: Implement test connection functionality
    console.log('Testing connection for:', integrationId);
  };

  const handleConfigure = (integration: IIntegration) => {
    setSelectedIntegration(integration);
    setIsConfigOpen(true);
  };

  const handleSaveConfiguration = () => {
    // TODO: Implement save configuration functionality
    console.log('Saving configuration for:', selectedIntegration);
    setIsConfigOpen(false);
    setSelectedIntegration(null);
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

  return (
    <div className="space-y-6">
      {/* Integration Status Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {integrations.map((integration) => (
          <div key={integration.id} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    integration.status === 'connected' ? 'bg-success-light text-success' :
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
                  <KeenIcon icon={getStatusIcon(integration.status)} className="text-lg" />
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
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{integration.apiKey}</code>
                    <Button size="sm" variant="ghost">
                      <KeenIcon icon="eye" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Tested</p>
                  <p className="text-sm">{integration.lastTested}</p>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleTestConnection(integration.id)}
                    className="flex-1"
                  >
                    <KeenIcon icon="refresh" className="me-1" />
                    Test
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

          <div className="px-6 pb-6">
            <div className="space-y-6">
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                value={selectedIntegration?.apiKey || ''}
                onChange={(e) => setSelectedIntegration(prev => prev ? {...prev, apiKey: e.target.value} : null)}
                className="mt-2"
                placeholder="Enter API key..."
              />
            </div>

            <div>
              <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
              <Input
                id="webhook-url"
                className="mt-2"
                placeholder="https://your-domain.com/webhook"
              />
            </div>

            <div>
              <Label htmlFor="environment">Environment</Label>
              <select className="mt-2 w-full p-2 border border-gray-300 rounded-md">
                <option value="production">Production</option>
                <option value="sandbox">Sandbox</option>
                <option value="test">Test</option>
              </select>
            </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  <KeenIcon icon="cross" className="me-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveConfiguration}>
                  <KeenIcon icon="check" className="me-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { IntegrationTiles };


