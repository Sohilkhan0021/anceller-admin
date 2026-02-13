import { useState, useCallback } from 'react';
import { MEPBannerManagementHeader } from './blocks/MEPBannerManagementHeader';
import { MEPBannerManagementTable } from './blocks/MEPBannerManagementTable';
import { AddEditMEPBannerForm } from './forms/AddEditMEPBannerForm';
import { ViewMEPBannerModal } from './blocks/ViewMEPBannerModal';
import { DeleteMEPBannerModal } from './blocks/DeleteMEPBannerModal';
import { MEPBannerSettings } from './blocks/MEPBannerSettings';
import { useMEPBanners } from '@/services';
import { mepBannerService } from '@/services/mepBanner.service';
import { IMEPBanner } from '@/services/mepBanner.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { toast } from 'sonner';

const MEPBannerManagementContent = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<IMEPBanner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<IMEPBanner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Filter state
  const [filters, setFilters] = useState<{ search: string; status: string }>({
    search: '',
    status: '',
  });

  // Fetch MEP banners with filters
  const {
    banners,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useMEPBanners({
    page: currentPage,
    limit: pageSize,
    status: filters.status,
    search: filters.search,
  });

  const handleAddBanner = () => {
    setSelectedBanner(null);
    setIsAddFormOpen(true);
  };

  const handleEditBanner = (banner: IMEPBanner) => {
    setSelectedBanner(banner);
    setIsEditFormOpen(true);
  };

  const handleViewBanner = (banner: IMEPBanner) => {
    setSelectedBanner(banner);
    setIsViewModalOpen(true);
  };

  const handleDeleteBanner = (banner: IMEPBanner) => {
    setBannerToDelete(banner);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (bannerId: string) => {
    setIsDeleting(true);
    try {
      await mepBannerService.deleteMEPBanner(bannerId);
      toast.success('MEP banner deleted successfully');
      setIsDeleteModalOpen(false);
      setBannerToDelete(null);
      await refetch();
    } catch (error: any) {
      console.error('Failed to delete MEP banner:', error);
      toast.error(error?.message || 'Failed to delete MEP banner. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setBannerToDelete(null);
    }
  };

  const handleSaveBanner = async (bannerData: any) => {
    try {
      if (!bannerData.image && !bannerData.mep_banner_id) {
        throw new Error('MEP banner image is required');
      }

      await mepBannerService.createMEPBanner({
        title: bannerData.title || '',
        image: bannerData.image,
        is_active: bannerData.is_active ?? true,
        banner_type: bannerData.banner_type || 'offer',
      });

      toast.success('MEP banner created successfully');
      setIsAddFormOpen(false);
      await refetch();
    } catch (error: any) {
      console.error('Failed to create MEP banner:', error);
      toast.error(error?.message || 'Failed to create MEP banner');
      throw error;
    }
  };

  const handleUpdateBanner = async (bannerData: any) => {
    try {
      if (!selectedBanner?.mep_banner_id) {
        throw new Error('MEP banner ID is required for update');
      }

      await mepBannerService.updateMEPBanner(selectedBanner.mep_banner_id, {
        title: bannerData.title || '',
        image: bannerData.image,
        image_url: bannerData.image ? undefined : selectedBanner.image_url,
        is_active: bannerData.is_active ?? true,
        banner_type: bannerData.banner_type || 'offer',
      });

      toast.success('MEP banner updated successfully');
      setIsEditFormOpen(false);
      setSelectedBanner(null);
      await refetch();
    } catch (error: any) {
      console.error('Failed to update MEP banner:', error);
      toast.error(error?.message || 'Failed to update MEP banner');
      throw error;
    }
  };

  const handleFiltersChange = useCallback((newFilters: { search: string; status: string }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setSelectedBanner(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedBanner(null);
  };

  const handleBannerTypeChange = async (banner: IMEPBanner, newType: 'offer' | 'buy_banner') => {
    try {
      if (!banner.mep_banner_id) {
        throw new Error('MEP Banner ID is required');
      }

      await mepBannerService.updateMEPBanner(banner.mep_banner_id, {
        banner_type: newType,
        image_url: banner.image_url,
      });

      toast.success('MEP banner type updated successfully');
      // Refresh banner list after successful update
      await refetch();
    } catch (error: any) {
      console.error('Failed to update MEP banner type:', error);
      toast.error(error?.message || 'Failed to update MEP banner type. Please try again.');
    }
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <MEPBannerManagementHeader
        onAddMEPBanner={handleAddBanner}
        onFiltersChange={handleFiltersChange}
        initialSearch={filters.search}
        initialStatus={filters.status || 'all'}
      />

      <MEPBannerSettings />

      {isError && (
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {error?.message || 'Failed to load MEP banners. Please try again.'}
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

      {isLoading && !isFetching ? (
        <div className="card">
          <div className="card-body">
            <ContentLoader />
          </div>
        </div>
      ) : (
        <MEPBannerManagementTable
          banners={banners}
          pagination={pagination}
          isLoading={isFetching}
          onViewBanner={handleViewBanner}
          onEditBanner={handleEditBanner}
          onDeleteBanner={handleDeleteBanner}
          onBannerTypeChange={handleBannerTypeChange}
          onPageChange={handlePageChange}
        />
      )}

      <AddEditMEPBannerForm
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSave={handleSaveBanner}
      />

      <AddEditMEPBannerForm
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        onSave={handleUpdateBanner}
        mepBannerData={selectedBanner}
      />

      <ViewMEPBannerModal
        banner={selectedBanner}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />

      <DeleteMEPBannerModal
        banner={bannerToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export { MEPBannerManagementContent };
