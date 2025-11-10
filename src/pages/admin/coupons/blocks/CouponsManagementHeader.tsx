import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';

interface ICouponsManagementHeaderProps {
  onCreatePromo: () => void;
}

const CouponsManagementHeader = ({ onCreatePromo }: ICouponsManagementHeaderProps) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="gift" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Coupons & Promo Codes</h1>
              <p className="text-sm text-gray-600">Manage discounts and marketing offers</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="file-down" className="me-2" />
              Export Data
            </Button>
            <Button size="sm" onClick={onCreatePromo} className="w-full sm:w-auto">
              <KeenIcon icon="plus" className="me-2" />
              Create Promo Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CouponsManagementHeader };
