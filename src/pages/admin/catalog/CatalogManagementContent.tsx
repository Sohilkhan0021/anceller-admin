import { useState } from 'react';
import { CatalogManagementHeader } from './blocks/CatalogManagementHeader';
import { ServiceTable } from './blocks/ServiceTable';
import { CategoryManagement } from './blocks/CategoryManagement';
import { SubServiceManagement } from './blocks/SubServiceManagement';
import { AddOnsManagement } from './blocks/AddOnsManagement';
import { AddServiceForm } from './forms/AddServiceForm';
import { EditServiceForm } from './forms/EditServiceForm';
import { PricingEditorModal } from './forms/PricingEditorModal';
import { Tabs, TabsList, Tab, TabPanel } from '@/components/tabs';
import { KeenIcon } from '@/components';

const CatalogManagementContent = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isPricingEditorOpen, setIsPricingEditorOpen] = useState(false);
  const [editService, setEditService] = useState<any>(null);

  const handleAddService = () => {
    setIsAddFormOpen(true);
  };

  const handleEditService = (service: any) => {
    setEditService(service);
    setIsEditFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setEditService(null);
  };

  const handleSaveService = (serviceData: any) => {
    console.log('Saving service:', serviceData);
    // TODO: Implement API call to save service
    setIsAddFormOpen(false);
  };

  const handleUpdateService = (serviceData: any) => {
    console.log('Updating service:', serviceData);
    // TODO: Implement API call to update service
    setIsEditFormOpen(false);
    setEditService(null);
  };

  const handleEditPricing = () => {
    setIsPricingEditorOpen(true);
  };

  const handleClosePricingEditor = () => {
    setIsPricingEditorOpen(false);
  };

  const handleSavePricing = (pricingData: any) => {
    console.log('Saving pricing data:', pricingData);
    // TODO: Implement API call to save pricing
    setIsPricingEditorOpen(false);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <CatalogManagementHeader 
        onAddService={handleAddService} 
        onEditPricing={handleEditPricing}
      />

      {/* Tabs Navigation */}
      <Tabs 
        value={activeTab} 
        onChange={(event, newValue) => setActiveTab(String(newValue) || 'categories')}
        className="w-full max-w-full overflow-x-hidden"
      >
        <TabsList className="grid w-full grid-cols-4">
          <Tab value="categories">
            <KeenIcon icon="category" className="me-2" />
            Categories
          </Tab>
          <Tab value="subservices">
            <KeenIcon icon="category" className="me-2" />
            Sub-Services
          </Tab>
          <Tab value="services">
            <KeenIcon icon="tag" className="me-2" />
            Services
          </Tab>
          <Tab value="addons">
            <KeenIcon icon="plus" className="me-2" />
            Add-Ons
          </Tab>
        </TabsList>

        {/* Categories Tab */}
        <TabPanel value="categories" className="mt-6 w-full max-w-full">
          <CategoryManagement />
        </TabPanel>

        {/* Sub-Services Tab */}
        <TabPanel value="subservices" className="mt-6 w-full max-w-full">
          <SubServiceManagement />
        </TabPanel>

        {/* Services Tab */}
        <TabPanel value="services" className="mt-6 w-full max-w-full overflow-x-hidden">
          <ServiceTable onEditService={handleEditService} />
        </TabPanel>

        {/* Add-Ons Tab */}
        <TabPanel value="addons" className="mt-6 w-full max-w-full">
          <AddOnsManagement />
        </TabPanel>
      </Tabs>

      {/* Add Service Form */}
      <AddServiceForm 
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSave={handleSaveService}
      />

      {/* Edit Service Form */}
      <EditServiceForm 
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        onSave={handleUpdateService}
        serviceData={editService}
      />

      {/* Pricing Editor Modal */}
      <PricingEditorModal 
        isOpen={isPricingEditorOpen}
        onClose={handleClosePricingEditor}
        onSave={handleSavePricing}
      />
    </div>
  );
};

export { CatalogManagementContent };


