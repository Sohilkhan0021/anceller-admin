import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { IServiceCostConfig, ICreateServiceCostConfig, IUpdateServiceCostConfig } from '@/services/serviceCost.service';

interface IAddEditServiceCostFormProps {
  config: IServiceCostConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateServiceCostConfig | IUpdateServiceCostConfig) => void;
  isLoading?: boolean;
}

const AddEditServiceCostForm = ({
  config,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: IAddEditServiceCostFormProps) => {
  const [formData, setFormData] = useState({
    service_cost_amount: 90,
    free_service_threshold: 500,
    service_cost_tax_rate: 10,
    order_tax_rate: 5,
    is_active: true,
    valid_from: '',
    valid_until: '',
    description: ''
  });

  useEffect(() => {
    if (config) {
      setFormData({
        service_cost_amount: config.service_cost_amount,
        free_service_threshold: config.free_service_threshold,
        service_cost_tax_rate: config.service_cost_tax_rate,
        order_tax_rate: config.order_tax_rate,
        is_active: config.is_active,
        valid_from: config.valid_from ? new Date(config.valid_from).toISOString().slice(0, 16) : '',
        valid_until: config.valid_until ? new Date(config.valid_until).toISOString().slice(0, 16) : '',
        description: config.description || ''
      });
    } else {
      // Reset to defaults for new config
      setFormData({
        service_cost_amount: 90,
        free_service_threshold: 500,
        service_cost_tax_rate: 10,
        order_tax_rate: 5,
        is_active: true,
        valid_from: new Date().toISOString().slice(0, 16),
        valid_until: '',
        description: ''
      });
    }
  }, [config, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.service_cost_amount || formData.service_cost_amount < 0) {
      alert('Please enter a valid service cost amount');
      return;
    }
    if (!formData.free_service_threshold || formData.free_service_threshold < 0) {
      alert('Please enter a valid free service threshold');
      return;
    }
    if (formData.service_cost_tax_rate < 0 || formData.service_cost_tax_rate > 100) {
      alert('Service cost tax rate must be between 0 and 100');
      return;
    }
    if (formData.order_tax_rate < 0 || formData.order_tax_rate > 100) {
      alert('Order tax rate must be between 0 and 100');
      return;
    }
    
    const submitData: any = {
      service_cost_amount: parseFloat(formData.service_cost_amount.toString()),
      free_service_threshold: parseFloat(formData.free_service_threshold.toString()),
      service_cost_tax_rate: parseFloat(formData.service_cost_tax_rate.toString()),
      order_tax_rate: parseFloat(formData.order_tax_rate.toString()),
      is_active: formData.is_active
    };

    // Only include description if it has a value
    if (formData.description && formData.description.trim()) {
      submitData.description = formData.description.trim();
    }

    // Handle valid_from - use current date if not provided
    if (formData.valid_from) {
      submitData.valid_from = new Date(formData.valid_from).toISOString();
    } else {
      submitData.valid_from = new Date().toISOString();
    }

    // Handle valid_until - can be null
    if (formData.valid_until) {
      submitData.valid_until = new Date(formData.valid_until).toISOString();
    } else {
      submitData.valid_until = null;
    }

    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {config ? 'Edit Service Cost Configuration' : 'Create Service Cost Configuration'}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_cost_amount">Service Cost Amount (₹)</Label>
                <Input
                  id="service_cost_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.service_cost_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, service_cost_amount: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Charged for orders below threshold</p>
              </div>

              <div>
                <Label htmlFor="free_service_threshold">Free Service Threshold (₹)</Label>
                <Input
                  id="free_service_threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.free_service_threshold}
                  onChange={(e) =>
                    setFormData({ ...formData, free_service_threshold: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Orders ≥ this amount get free service</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_cost_tax_rate">Service Cost Tax Rate (%)</Label>
                <Input
                  id="service_cost_tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.service_cost_tax_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, service_cost_tax_rate: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Tax on service cost (when service cost &gt; 0)</p>
              </div>

              <div>
                <Label htmlFor="order_tax_rate">Order Tax Rate (%)</Label>
                <Input
                  id="order_tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.order_tax_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, order_tax_rate: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Tax on order (when service cost = 0)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">Valid From</Label>
                <Input
                  id="valid_from"
                  type="datetime-local"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="valid_until">Valid Until (Optional)</Label>
                <Input
                  id="valid_until"
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Add a description for this configuration..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active Configuration
              </Label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Calculation Preview:</h4>
              <div className="text-sm space-y-1">
                <div>
                  Order &lt; ₹{formData.free_service_threshold}: Service Cost = ₹{formData.service_cost_amount}, Tax = {formData.service_cost_tax_rate}% of service cost
                </div>
                <div>
                  Order ≥ ₹{formData.free_service_threshold}: Service Cost = ₹0, Tax = {formData.order_tax_rate}% of order amount
                </div>
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : config ? 'Update Configuration' : 'Create Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddEditServiceCostForm };
