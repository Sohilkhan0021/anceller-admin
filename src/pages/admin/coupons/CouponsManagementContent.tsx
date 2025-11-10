import { useState } from 'react';
import { CouponsManagementHeader } from './blocks/CouponsManagementHeader';
import { PromoCodesList } from './blocks/PromoCodesList';
import { AddPromoForm } from './forms/AddPromoForm';
import { EditPromoForm } from './forms/EditPromoForm';

const CouponsManagementContent = () => {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editPromo, setEditPromo] = useState(null);

  const handleCreatePromo = () => {
    setIsAddFormOpen(true);
  };

  const handleEditPromo = (promo: any) => {
    setEditPromo(promo);
    setIsEditFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setEditPromo(null);
  };

  const handleSavePromo = (promoData: any) => {
    console.log('Saving promo:', promoData);
    // TODO: Implement API call to save promo
    setIsAddFormOpen(false);
  };

  const handleUpdatePromo = (promoData: any) => {
    console.log('Updating promo:', promoData);
    // TODO: Implement API call to update promo
    setIsEditFormOpen(false);
    setEditPromo(null);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header */}
      <CouponsManagementHeader onCreatePromo={handleCreatePromo} />

      {/* Promo Codes List */}
      <PromoCodesList onEditPromo={handleEditPromo} />

      {/* Add Promo Form */}
      <AddPromoForm 
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSave={handleSavePromo}
      />

      {/* Edit Promo Form */}
      <EditPromoForm 
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        onSave={handleUpdatePromo}
        promoData={editPromo}
      />
    </div>
  );
};

export { CouponsManagementContent };
