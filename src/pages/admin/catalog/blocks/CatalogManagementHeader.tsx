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
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="category" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Catalog & Pricing Management</h1>
              <p className="text-sm text-gray-600">Manage categories, sub-services, and pricing</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
          {/*   <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onEditPricing}
                    className="hover:bg-gray-50 hover:border-gray-300 transition-colors w-full sm:w-auto"
                  >
                    <KeenIcon icon="setting-2" className="me-2" />
                    Edit Pricing
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Changes affect new bookings only</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
            
            <Button size="sm" onClick={onAddService} className="w-full sm:w-auto">
              <KeenIcon icon="plus" className="me-2" />
              Add New Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CatalogManagementHeader };


