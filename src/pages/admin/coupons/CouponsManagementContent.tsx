import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from 'react-query';
import { useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/services';
import { ICoupon, IDeleteCouponResponse } from '@/services/coupon.types';
import { CouponsManagementHeader } from './blocks/CouponsManagementHeader';
import { PromoCodesList } from './blocks/PromoCodesList';
import { AddPromoForm } from './forms/AddPromoForm';
import { EditPromoForm } from './forms/EditPromoForm';

const CouponsManagementContent = () => {
  const queryClient = useQueryClient();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editPromo, setEditPromo] = useState<ICoupon | null>(null);

  // Mutations
  const { mutate: createCoupon, isLoading: isCreating } = useCreateCoupon({
    onSuccess: (data) => {
      toast.success(data.message || 'Coupon created successfully');
      setIsAddFormOpen(false);
      queryClient.invalidateQueries(['coupons']);
      queryClient.invalidateQueries(['coupon-stats']);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create coupon');
    }
  });

  const { mutate: updateCoupon, isLoading: isUpdating } = useUpdateCoupon({
    onSuccess: (data) => {
      toast.success(data.message || 'Coupon updated successfully');
      setIsEditFormOpen(false);
      setEditPromo(null);
      queryClient.invalidateQueries(['coupons']);
      queryClient.invalidateQueries(['coupon-stats']);
      queryClient.invalidateQueries(['coupon-detail']);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update coupon');
    }
  });

  const { mutate: deleteCoupon } = useDeleteCoupon({
    onSuccess: (data: IDeleteCouponResponse) => {
      toast.success(data.message || 'Coupon deleted successfully');
      queryClient.invalidateQueries(['coupons']);
      queryClient.invalidateQueries(['coupon-stats']);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete coupon');
    }
  });

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
    // Validate max discount <= min order amount if both are provided
    if (promoData.minOrderAmount && promoData.maxDiscount) {
      const minAmount = parseFloat(promoData.minOrderAmount);
      const maxDiscount = parseFloat(promoData.maxDiscount);
      if (maxDiscount > minAmount) {
        toast.error('Maximum discount cannot be greater than minimum order amount');
        return;
      }
    }
    
    // Transform UI data to API request format
    const apiData: any = {
      code: promoData.code,
      name: promoData.name,
      coupon_type: promoData.type === 'percentage' ? 'PERCENTAGE' : 'FLAT_AMOUNT',
      discount_value: parseFloat(promoData.value),
      max_usage: promoData.usageLimit ? parseInt(promoData.usageLimit) : undefined,
      valid_until: promoData.endDate ? new Date(promoData.endDate).toISOString() : new Date().toISOString(),
      description: promoData.description,
      min_order_amount: promoData.minOrderAmount ? parseFloat(promoData.minOrderAmount) : undefined,
      max_discount: promoData.maxDiscount ? parseFloat(promoData.maxDiscount) : undefined
    };

    createCoupon(apiData);
  };

  const handleUpdatePromo = (promoData: any) => {
    // Validate max discount <= min order amount if both are provided
    if (promoData.minOrderAmount && promoData.maxDiscount) {
      const minAmount = parseFloat(promoData.minOrderAmount);
      const maxDiscount = parseFloat(promoData.maxDiscount);
      if (maxDiscount > minAmount) {
        toast.error('Maximum discount cannot be greater than minimum order amount');
        return;
      }
    }
    
    // Transform UI data to API request format
    const apiData: any = {
      code: promoData.code,
      name: promoData.name,
      coupon_type: promoData.type === 'percentage' ? 'PERCENTAGE' : 'FLAT_AMOUNT',
      discount_value: parseFloat(promoData.value),
      max_usage: promoData.usageLimit ? parseInt(promoData.usageLimit) : undefined,
      valid_until: promoData.endDate ? new Date(promoData.endDate).toISOString() : new Date().toISOString(),
      description: promoData.description,
      min_order_amount: promoData.minOrderAmount ? parseFloat(promoData.minOrderAmount) : undefined,
      max_discount: promoData.maxDiscount ? parseFloat(promoData.maxDiscount) : undefined,
      is_active: promoData.isActive !== false
    };

    if (editPromo?.id || editPromo?.coupon_id) {
      const couponId = editPromo.id || editPromo.coupon_id;
      if (!couponId) {
        throw new Error('Coupon ID is required for update');
      }
      updateCoupon({ id: couponId, data: apiData });
    }
  };

  const handleDeletePromo = (promoId: string) => {
    deleteCoupon(promoId);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header */}
      <CouponsManagementHeader onCreatePromo={handleCreatePromo} />

      {/* Promo Codes List */}
      <PromoCodesList
        onEditPromo={handleEditPromo}
        onDeletePromo={handleDeletePromo}
      />

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
