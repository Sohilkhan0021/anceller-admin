import { useState, useCallback } from 'react';
import { SubBannerManagementHeader } from './blocks/SubBannerManagementHeader';
import { SubBannerManagementTable } from './blocks/SubBannerManagementTable';
import { AddEditSubBannerForm } from './forms/AddEditSubBannerForm';
import { ViewSubBannerModal } from './blocks/ViewSubBannerModal';
import { DeleteSubBannerModal } from './blocks/DeleteSubBannerModal';
import { useSubBanners } from '@/services';
import { subBannerService } from '@/services/subBanner.service';
import { ISubBanner } from '@/services/subBanner.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

const SubBannerManagementContent = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubBanner, setSelectedSubBanner] = useState<ISubBanner | null>(null);
  const [subBannerToDelete, setSubBannerToDelete] = useState<ISubBanner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Filter state
  const [filters, setFilters] = useState<{ search: string; status: string }>({
    search: '',
    status: '',
  });

  // Fetch sub-banners with filters
  const {
    subBanners,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useSubBanners({
    page: currentPage,
    limit: pageSize,
    status: filters.status,
    search: filters.search,
  });

  const handleAddSubBanner = () => {
    setSelectedSubBanner(null);
    setIsAddFormOpen(true);
  };

  const handleEditSubBanner = (subBanner: ISubBanner) => {
    setSelectedSubBanner(subBanner);
    setIsEditFormOpen(true);
  };

  const handleViewSubBanner = (subBanner: ISubBanner) => {
    setSelectedSubBanner(subBanner);
    setIsViewModalOpen(true);
  };

  const handleDeleteSubBanner = (subBanner: ISubBanner) => {
    setSubBannerToDelete(subBanner);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (subBannerId: string) => {
    setIsDeleting(true);
    try {
      await subBannerService.deleteSubBanner(subBannerId);
      setIsDeleteModalOpen(false);
      setSubBannerToDelete(null);
      await refetch();
    } catch (error: any) {
      console.error('Failed to delete sub-banner:', error);
      alert(error?.message || 'Failed to delete sub-banner. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setSubBannerToDelete(null);
    }
  };

  const handleSaveSubBanner = async (subBannerData: any) => {
    try {
      if (!subBannerData.image) {
        throw new Error('Sub-banner image is required');
      }

      await subBannerService.createSubBanner({
        title: subBannerData.title || '',
        image: subBannerData.image,
        is_active: subBannerData.is_active ?? true,
        category_id: subBannerData.category_id || null,
      });

      setIsAddFormOpen(false);
      await refetch();
    } catch (error: any) {
      console.error('Failed to create sub-banner:', error);
      throw error;
    }
  };

  const handleUpdateSubBanner = async (subBannerData: any) => {
    try {
      if (!selectedSubBanner?.sub_banner_id) {
        throw new Error('Sub-banner ID is required for update');
      }

      await subBannerService.updateSubBanner(selectedSubBanner.sub_banner_id, {
        title: subBannerData.title || '',
        image: subBannerData.image,
        image_url: subBannerData.image ? undefined : selectedSubBanner.image_url,
        is_active: subBannerData.is_active ?? true,
        category_id: subBannerData.category_id !== undefined ? subBannerData.category_id : selectedSubBanner.category_id || null,
      });

      setIsEditFormOpen(false);
      setSelectedSubBanner(null);
      await refetch();
    } catch (error: any) {
      console.error('Failed to update sub-banner:', error);
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
    setSelectedSubBanner(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedSubBanner(null);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <SubBannerManagementHeader
        onAddSubBanner={handleAddSubBanner}
        onFiltersChange={handleFiltersChange}
        initialSearch={filters.search}
        initialStatus={filters.status || 'all'}
      />

      {isError && (
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {error?.message || 'Failed to load sub-banners. Please try again.'}
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
        <SubBannerManagementTable
          subBanners={subBanners}
          pagination={pagination}
          isLoading={isFetching}
          onViewSubBanner={handleViewSubBanner}
          onEditSubBanner={handleEditSubBanner}
          onDeleteSubBanner={handleDeleteSubBanner}
          onPageChange={handlePageChange}
        />
      )}

      <AddEditSubBannerForm
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSave={handleSaveSubBanner}
      />

      <AddEditSubBannerForm
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        onSave={handleUpdateSubBanner}
        subBannerData={selectedSubBanner}
      />

      <ViewSubBannerModal
        subBanner={selectedSubBanner}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />

      <DeleteSubBannerModal
        subBanner={subBannerToDelete}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export { SubBannerManagementContent };
