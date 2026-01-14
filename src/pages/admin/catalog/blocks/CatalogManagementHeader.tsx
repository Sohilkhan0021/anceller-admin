import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ICatalogManagementHeaderProps {
  onAddService?: () => void;
  onEditPricing?: () => void;
}

const CatalogManagementHeader = ({ onAddService, onEditPricing }: ICatalogManagementHeaderProps) => {
  return (
    <div className="card">
      <div className="card-header flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <KeenIcon icon="category" className="text-primary text-2xl" />
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Catalog & Pricing Management</h1>
            <p className="text-sm text-gray-600">Manage categories, sub-services, and pricing</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={onAddService} className="w-full sm:w-auto">
            <KeenIcon icon="plus" className="me-2" />
            Add New Service
          </Button>
        </div>
      </div>
    </div>
  );
};

export { CatalogManagementHeader };


