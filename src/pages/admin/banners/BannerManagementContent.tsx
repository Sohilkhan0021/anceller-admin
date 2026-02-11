import { useState, useCallback } from 'react';
import { BannerManagementHeader } from './blocks/BannerManagementHeader';
import { BannerManagementTable } from './blocks/BannerManagementTable';
import { AddEditBannerForm } from './forms/AddEditBannerForm';
import { ViewBannerModal } from './blocks/ViewBannerModal';
import { DeleteBannerModal } from './blocks/DeleteBannerModal';
import { useBanners } from '@/services';
import { bannerService } from '@/services/banner.service';
import { IBanner } from '@/services/banner.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

const BannerManagementContent = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<IBanner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<IBanner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Filter state
  const [filters, setFilters] = useState<{ search: string; status: string }>({
    search: '',
    status: '',
  });

  // Fetch banners with filters
  const {
    banners,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useBanners({
    page: currentPage,
    limit: pageSize,
    status: filters.status,
    search: filters.search,
  });

  const handleAddBanner = () => {
    setSelectedBanner(null);
    setIsAddFormOpen(true);
  };

  const handleEditBanner = (banner: IBanner) => {
    setSelectedBanner(banner);
    setIsEditFormOpen(true);
  };

  const handleViewBanner = (banner: IBanner) => {
    setSelectedBanner(banner);
    setIsViewModalOpen(true);
  };

  const handleDeleteBanner = (banner: IBanner) => {
    setBannerToDelete(banner);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (bannerId: string) => {
    setIsDeleting(true);
    try {
      await bannerService.deleteBanner(bannerId);
      setIsDeleteModalOpen(false);
      setBannerToDelete(null);
      // Refresh banner list after successful deletion
      await refetch();
    } catch (error: any) {
      console.error('Failed to delete banner:', error);
      // Error handling - you might want to show a toast notification here
      alert(error?.message || 'Failed to delete banner. Please try again.');
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
      if (!bannerData.image) {
        throw new Error('Banner image is required');
      }

      await bannerService.createBanner({
        title: bannerData.title || '',
        image: bannerData.image,
        is_active: bannerData.is_active ?? true,
        category_id: bannerData.category_id || null,
      });

      setIsAddFormOpen(false);
      // Refresh banner list after successful creation
      await refetch();
    } catch (error: any) {
      console.error('Failed to create banner:', error);
      // Re-throw error so form can handle it
      throw error;
    }
  };

  const handleUpdateBanner = async (bannerData: any) => {
    try {
      if (!selectedBanner?.banner_id) {
        throw new Error('Banner ID is required for update');
      }

      await bannerService.updateBanner(selectedBanner.banner_id, {
        title: bannerData.title || '',
        image: bannerData.image,
        image_url: bannerData.image ? undefined : selectedBanner.image_url,
        is_active: bannerData.is_active ?? true,
        category_id: bannerData.category_id !== undefined ? bannerData.category_id : selectedBanner.category_id || null,
      });

      setIsEditFormOpen(false);
      setSelectedBanner(null);
      // Refresh banner list after successful update
      await refetch();
    } catch (error: any) {
      console.error('Failed to update banner:', error);
      // Re-throw error so form can handle it
      throw error;
    }
  };

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: { search: string; status: string }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
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

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header with search and filters */}
      <BannerManagementHeader
        onAddBanner={handleAddBanner}
        onFiltersChange={handleFiltersChange}
        initialSearch={filters.search}
        initialStatus={filters.status || 'all'}
      />

      {/* Error State */}
      {isError && (
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {error?.message || 'Failed to load banners. Please try again.'}
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
        /* Banner Management Table */
        <BannerManagementTable
          banners={banners}
          pagination={pagination}
          isLoading={isFetching}
          onViewBanner={handleViewBanner}
          onEditBanner={handleEditBanner}
          onDeleteBanner={handleDeleteBanner}
          onPageChange={handlePageChange}
        />
      )}

      {/* Add Banner Form */}
      <AddEditBannerForm
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSave={handleSaveBanner}
      />

      {/* Edit Banner Form */}
      <AddEditBannerForm
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        onSave={handleUpdateBanner}
        bannerData={selectedBanner}
      />

      {/* View Banner Modal */}
      <ViewBannerModal
        banner={selectedBanner}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteBannerModal
        banner={bannerToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export { BannerManagementContent };
