import { useState } from 'react';
import { ProviderManagementHeader } from './blocks/ProviderManagementHeader';
import { ProviderKPICards } from './blocks/ProviderKPICards';
import { ProviderManagementTable } from './blocks/ProviderManagementTable';
import { ProviderProfileModal } from './blocks/ProviderProfileModal';
import { AddProviderForm } from './forms/AddProviderForm';
import { EditProviderForm } from './forms/EditProviderForm';

interface IProvider {
  id: string;
  name: string;
  serviceCategory: string;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'under-review';
  rating: number;
  jobsCompleted: number;
  earnings: number;
  status: 'active' | 'blocked' | 'suspended';
  joinDate: string;
  lastActive: string;
}

const ProviderManagementContent = () => {
  const [selectedProvider, setSelectedProvider] = useState<IProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<IProvider | null>(null);

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
  };

  const handleUpdateProvider = (providerData: any) => {
    console.log('Updating provider:', providerData);
    // TODO: Implement API call to update provider
    setIsEditFormOpen(false);
    setEditProvider(null);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header with search and filters */}
      <ProviderManagementHeader onAddProvider={handleAddProvider} />

      {/* KPI Cards */}
      <ProviderKPICards />

      {/* Provider Management Table */}
      <ProviderManagementTable 
        onProviderSelect={handleProviderSelect} 
        onEditProvider={handleEditProvider}
      />

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
