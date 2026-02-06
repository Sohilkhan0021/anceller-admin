import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import {
  getServiceCostConfigs,
  getActiveServiceCostConfig,
  createServiceCostConfig,
  updateServiceCostConfig,
  deleteServiceCostConfig,
  IServiceCostConfig,
  ICreateServiceCostConfig,
  IUpdateServiceCostConfig
} from '@/services/serviceCost.service';
import { ServiceCostManagementHeader } from './blocks/ServiceCostManagementHeader';
import { ServiceCostManagementTable } from './blocks/ServiceCostManagementTable';
import { AddEditServiceCostForm } from './forms/AddEditServiceCostForm';

const ServiceCostManagementContent = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<IServiceCostConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  // Fetch configurations
  const { data: configsData, isLoading, refetch } = useQuery(
    ['service-cost-configs', currentPage, isActiveFilter],
    () => getServiceCostConfigs({ page: currentPage, limit: 20, is_active: isActiveFilter }),
    { 
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: true
    }
  );

  // Fetch active config
  const { data: activeConfig, refetch: refetchActive } = useQuery(
    ['active-service-cost-config'],
    () => getActiveServiceCostConfig(),
    { 
      refetchOnWindowFocus: true,
      refetchOnMount: true
    }
  );

  // Create mutation
  const createMutation = useMutation(createServiceCostConfig, {
    onSuccess: async () => {
      toast.success('Service cost configuration created successfully');
      setIsFormOpen(false);
      // Invalidate queries first
      queryClient.invalidateQueries(['service-cost-configs']);
      queryClient.invalidateQueries(['active-service-cost-config']);
      // Explicitly refetch to ensure immediate update
      await Promise.all([
        refetch(),
        refetchActive()
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create service cost configuration');
    }
  });

  // Update mutation
  const updateMutation = useMutation(
    ({ configId, data }: { configId: string; data: IUpdateServiceCostConfig }) =>
      updateServiceCostConfig(configId, data),
    {
      onSuccess: async () => {
        toast.success('Service cost configuration updated successfully');
        setIsFormOpen(false);
        setEditingConfig(null);
        // Invalidate queries first
        queryClient.invalidateQueries(['service-cost-configs']);
        queryClient.invalidateQueries(['active-service-cost-config']);
        // Explicitly refetch to ensure immediate update
        await Promise.all([
          refetch(),
          refetchActive()
        ]);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update service cost configuration');
      }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(deleteServiceCostConfig, {
    onSuccess: async () => {
      toast.success('Service cost configuration deleted successfully');
      // Invalidate queries first
      queryClient.invalidateQueries(['service-cost-configs']);
      queryClient.invalidateQueries(['active-service-cost-config']);
      // Explicitly refetch to ensure immediate update
      await Promise.all([
        refetch(),
        refetchActive()
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete service cost configuration');
    }
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation(
    ({ configId, isActive }: { configId: string; isActive: boolean }) =>
      updateServiceCostConfig(configId, { is_active: isActive }),
    {
      onSuccess: async (_, variables) => {
        toast.success(`Configuration ${variables.isActive ? 'activated' : 'deactivated'} successfully`);
        await Promise.all([refetch(), refetchActive()]);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to update configuration status');
      }
    }
  );

  const handleCreate = () => {
    setEditingConfig(null);
    setIsFormOpen(true);
  };

  const handleEdit = (config: IServiceCostConfig) => {
    setEditingConfig(config);
    setIsFormOpen(true);
  };

  const handleDelete = (configId: string) => {
    if (window.confirm('Are you sure you want to delete this configuration? It will be deactivated.')) {
      deleteMutation.mutate(configId);
    }
  };

  const handleToggleActive = (config: IServiceCostConfig) => {
    toggleActiveMutation.mutate({ 
      configId: config.config_id, 
      isActive: !config.is_active 
    });
  };

  const handleSubmit = (data: ICreateServiceCostConfig | IUpdateServiceCostConfig) => {
    if (editingConfig) {
      updateMutation.mutate({ configId: editingConfig.config_id, data });
    } else {
      createMutation.mutate(data as ICreateServiceCostConfig);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingConfig(null);
  };

  return (
    <div className="space-y-6">
      <ServiceCostManagementHeader
        onCreate={handleCreate}
        activeConfig={activeConfig}
      />

      <ServiceCostManagementTable
        configs={configsData?.configs || []}
        pagination={configsData?.pagination || null}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onPageChange={setCurrentPage}
        onFilterChange={setIsActiveFilter}
        currentFilter={isActiveFilter}
      />

      {isFormOpen && (
        <AddEditServiceCostForm
          config={editingConfig}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
    </div>
  );
};

export { ServiceCostManagementContent };
