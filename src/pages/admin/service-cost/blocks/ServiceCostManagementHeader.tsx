import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IServiceCostConfig } from '@/services/serviceCost.service';

interface IServiceCostManagementHeaderProps {
  onCreate: () => void;
  activeConfig: IServiceCostConfig | undefined;
}

const ServiceCostManagementHeader = ({ onCreate, activeConfig }: IServiceCostManagementHeaderProps) => {
  return (
    <div className="card">
      <div className="card-header flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <KeenIcon icon="calculator" className="text-primary text-2xl" />
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Service Cost Configuration</h1>
            <p className="text-sm text-gray-600">Manage service charges and tax rates for orders</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeConfig && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <Badge variant="success" className="text-xs">
                Active
              </Badge>
              <span className="text-sm text-gray-700">
                ₹{activeConfig.service_cost_amount} service fee for orders &lt; ₹{activeConfig.free_service_threshold}
              </span>
            </div>
          )}
          <Button size="sm" onClick={onCreate} className="w-full sm:w-auto">
            <KeenIcon icon="plus" className="me-2" />
            Create Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ServiceCostManagementHeader };
