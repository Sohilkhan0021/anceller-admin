import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useQueryClient } from 'react-query';
import { ProviderManagementHeader } from './blocks/ProviderManagementHeader';
import { ProviderKPICards } from './blocks/ProviderKPICards';
import { ProviderManagementTable } from './blocks/ProviderManagementTable';
import { ProviderProfileModal } from './blocks/ProviderProfileModal';
import { AddProviderForm } from './forms/AddProviderForm';
import { EditProviderForm } from './forms/EditProviderForm';
import { useProviders, useCreateProvider, useUpdateProvider } from '@/services';
import { IProvider } from '@/services/provider.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

const ProviderManagementContent = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProvider, setSelectedProvider] = useState<IProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<IProvider | null>(null);

  // Initialize filters from URL params
  const kycStatusFromUrl = searchParams.get('kyc_status') || '';
  const statusFromUrl = searchParams.get('status') || '';

  // Filter state
  const [filters, setFilters] = useState<{ search: string; status: string; kyc_status?: string; category_id?: string }>({
    search: '',
    status: statusFromUrl,
    kyc_status: kycStatusFromUrl,
    category_id: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Update filters when URL params change
  useEffect(() => {
    const kycStatus = searchParams.get('kyc_status') || '';
    const status = searchParams.get('status') || '';
    if (kycStatus || status) {
      setFilters(prev => ({
        ...prev,
        kyc_status: kycStatus,
        status: status,
      }));
    }
  }, [searchParams]);

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
    kyc_status: filters.kyc_status,
    category_id: filters.category_id,
  });

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: { search: string; status: string; category_id?: string }) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      kyc_status: prev.kyc_status, // Preserve kyc_status
    }));
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

  // Create provider mutation
  const { mutateAsync: createProvider, isLoading: isCreating } = useCreateProvider({
    onSuccess: (data) => {
      // toast.success('Provider created successfully'); // Form will handle success toast
      setIsAddFormOpen(false);
      queryClient.invalidateQueries(['providers']);
      queryClient.invalidateQueries(['coupon-stats']); // Also invalidate stats if they depend on providers
    }
  });

  const handleSaveProvider = async (providerData: any) => {
    // Transform form data to API format
    const apiData: any = {
      first_name: providerData.firstName,
      last_name: providerData.lastName,
      email: providerData.email,
      phone: providerData.phone,
      password: providerData.password || undefined, // Optional password
      business_name: providerData.businessName || `${providerData.firstName} ${providerData.lastName}`.trim(),
      category_ids: providerData.serviceCategory ? [providerData.serviceCategory] : [],
      pan_number: providerData.panNumber,
      aadhaarNumber: providerData.aadhaarNumber,
      bank_account_number: providerData.bankAccount,
      bank_ifsc: providerData.ifscCode,
      address: providerData.address,
      city: providerData.city,
      state: providerData.state,
      pincode: providerData.pincode,
      kyc_status: providerData.kycStatus || 'pending',
      status: providerData.status || 'active',
      isVerified: providerData.isVerified || false,
      notes: providerData.notes,
    };

    return createProvider(apiData);
  };

  const { mutateAsync: updateProvider, isLoading: isUpdating } = useUpdateProvider({
    onSuccess: (data) => {
      toast.success('Provider updated successfully');
      setIsEditFormOpen(false);
      setEditProvider(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update provider');
    },
  });

  const handleUpdateProvider = async (providerData: any) => {
    if (!editProvider?.id && !editProvider?.provider_id) {
      toast.error('Provider ID is missing');
      return;
    }
    
    const providerId = editProvider.id || editProvider.provider_id;
    if (!providerId) {
      toast.error('Provider ID is missing');
      return;
    }
    
    // Transform form data to API format
    const apiData: any = {
      business_name: providerData.businessName || providerData.business_name,
      first_name: providerData.firstName,
      last_name: providerData.lastName,
      email: providerData.email,
      pan_number: providerData.panNumber,
      bank_account_number: providerData.bankAccount,
      bank_ifsc: providerData.ifscCode,
      category_ids: providerData.serviceCategory ? [providerData.serviceCategory] : undefined,
    };

    // Remove undefined values
    Object.keys(apiData).forEach(key => apiData[key] === undefined && delete apiData[key]);

    try {
      await updateProvider({ providerId: providerId as string, data: apiData });
    } catch (error) {
      // Error is handled by the hook's onError callback
    }
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header with search and filters */}
      <ProviderManagementHeader
        onAddProvider={handleAddProvider}
        onFiltersChange={handleFiltersChange}
        initialSearch={filters.search}
        initialStatus={filters.status || 'all'}
        initialCategoryId={filters.category_id || 'all'}
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
