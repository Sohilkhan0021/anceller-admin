import { useState, useCallback } from 'react';
import { ProviderManagementHeader } from './blocks/ProviderManagementHeader';
import { ProviderKPICards } from './blocks/ProviderKPICards';
import { ProviderManagementTable } from './blocks/ProviderManagementTable';
import { ProviderProfileModal } from './blocks/ProviderProfileModal';
import { AddProviderForm } from './forms/AddProviderForm';
import { EditProviderForm } from './forms/EditProviderForm';
import { useProviders } from '@/services';
import { IProvider } from '@/services/provider.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

const ProviderManagementContent = () => {
  const [selectedProvider, setSelectedProvider] = useState<IProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<IProvider | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<{ search: string; status: string }>({
    search: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch providers with filters
  const { 
    providers, 
    pagination, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useProviders({
    page: currentPage,
    limit: pageSize,
    status: filters.status,
    search: filters.search,
  });

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: { search: string; status: string }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleProviderSelect = (provider: IProvider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
  };

  const handleAddProvider = () => {
    setIsAddFormOpen(true);
  };

  const handleEditProvider = (provider: IProvider) => {
    setEditProvider(provider);
    setIsEditFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setEditProvider(null);
  };

  const handleSaveProvider = (providerData: any) => {
    console.log('Saving provider:', providerData);
    // TODO: Implement API call to save provider
    setIsAddFormOpen(false);
    // Refetch providers after save
    refetch();
  };

  const handleUpdateProvider = (providerData: any) => {
    console.log('Updating provider:', providerData);
    // TODO: Implement API call to update provider
    setIsEditFormOpen(false);
    setEditProvider(null);
    // Refetch providers after update
    refetch();
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header with search and filters */}
      <ProviderManagementHeader 
        onAddProvider={handleAddProvider}
        onFiltersChange={handleFiltersChange}
        initialSearch={filters.search}
        initialStatus={filters.status || 'all'}
      />

      {/* KPI Cards */}
      <ProviderKPICards />

      {/* Error State */}
      {isError && (
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {error?.message || 'Failed to load providers. Please try again.'}
            </span>
            <button
              onClick={() => refetch()}
              className="text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !isFetching ? (
        <div className="card">
          <div className="card-body">
            <ContentLoader />
          </div>
        </div>
      ) : (
        /* Provider Management Table */
        <ProviderManagementTable 
          providers={providers}
          pagination={pagination}
          isLoading={isFetching}
          onProviderSelect={handleProviderSelect} 
          onEditProvider={handleEditProvider}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Provider Profile Modal */}
      <ProviderProfileModal 
        provider={selectedProvider} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />

      {/* Add Provider Form */}
      <AddProviderForm 
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSave={handleSaveProvider}
      />

      {/* Edit Provider Form */}
      <EditProviderForm 
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        onSave={handleUpdateProvider}
        providerData={editProvider}
      />
    </div>
  );
};

export { ProviderManagementContent };
