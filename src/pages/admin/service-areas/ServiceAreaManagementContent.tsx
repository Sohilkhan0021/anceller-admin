import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from 'react-query';
import {
  useServiceAreas,
  useCreateServiceArea,
  useUpdateServiceArea,
  useDeleteServiceArea,
} from '@/services';
import type { IServiceArea, ICreateServiceAreaRequest, IUpdateServiceAreaRequest } from '@/services';
import { ServiceAreaManagementTable } from './blocks/ServiceAreaManagementTable';
import { ServiceAreaManagementHeader } from './blocks/ServiceAreaManagementHeader';
import { AddEditServiceAreaForm } from './forms/AddEditServiceAreaForm';

const ServiceAreaManagementContent = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<IServiceArea | null>(null);

  const { data, isLoading, refetch } = useServiceAreas({
    page: currentPage,
    limit: 20,
    search,
  });

  const areas = data?.areas || [];
  const pagination = data?.pagination || null;

  const createMutation = useCreateServiceArea({
    onSuccess: () => {
      toast.success('Service area created successfully');
      setIsFormOpen(false);
      queryClient.invalidateQueries(['service-areas']);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create service area');
    },
  });

  const updateMutation = useUpdateServiceArea({
    onSuccess: () => {
      toast.success('Service area updated successfully');
      setIsFormOpen(false);
      setEditingArea(null);
      queryClient.invalidateQueries(['service-areas']);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update service area');
    },
  });

  const deleteMutation = useDeleteServiceArea({
    onSuccess: () => {
      toast.success('Service area deleted successfully');
      queryClient.invalidateQueries(['service-areas']);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete service area');
    },
  });

  const handleCreate = () => {
    setEditingArea(null);
    setIsFormOpen(true);
  };

  const handleEdit = (area: IServiceArea) => {
    setEditingArea(area);
    setIsFormOpen(true);
  };

  const handleDelete = (areaId: string) => {
    if (window.confirm('Are you sure you want to delete this service area?')) {
      deleteMutation.mutate(areaId);
    }
  };

  const handleSubmit = (data: ICreateServiceAreaRequest | IUpdateServiceAreaRequest) => {
    if (editingArea) {
      updateMutation.mutate({ areaId: editingArea.area_id, data: data as IUpdateServiceAreaRequest });
    } else {
      createMutation.mutate(data as ICreateServiceAreaRequest);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingArea(null);
  };

  return (
    <div className="space-y-6">
      <ServiceAreaManagementHeader
        onCreate={handleCreate}
        search={search}
        onSearchChange={setSearch}
      />

      <ServiceAreaManagementTable
        areas={areas}
        pagination={pagination}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={setCurrentPage}
      />

      {isFormOpen && (
        <AddEditServiceAreaForm
          area={editingArea}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
    </div>
  );
};

export { ServiceAreaManagementContent };

