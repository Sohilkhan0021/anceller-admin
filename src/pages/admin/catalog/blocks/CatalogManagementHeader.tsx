import { KeenIcon } from '@/components';

const CatalogManagementHeader = () => {
  return (
    <div className="card">
      <div className="card-header flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <KeenIcon icon="category" className="text-primary text-2xl" />
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Catalog & Pricing Management</h1>
            <p className="text-sm text-gray-600">Manage catalog services, sub-services, and pricing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CatalogManagementHeader };
