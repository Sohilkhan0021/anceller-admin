import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getCommissionTiers,
  createCommissionTier,
  updateCommissionTier,
  deleteCommissionTier,
  getAdminProviderPackages,
  createProviderPackage,
  updateProviderPackage,
  deleteProviderPackage,
  type ICommissionTier,
  type IProviderPackage,
  type CommissionTierUpdatePayload,
  type ProviderPackageUpdatePayload,
} from './billingModels.service';

export const useCommissionTiers = () =>
  useQuery<ICommissionTier[], Error>(['commission-tiers'], getCommissionTiers);

export const useCreateCommissionTier = () => {
  const queryClient = useQueryClient();
  return useMutation(createCommissionTier, {
    onSuccess: () => {
      queryClient.invalidateQueries(['commission-tiers']);
    },
  });
};

export const useUpdateCommissionTier = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ tierId, data }: { tierId: string; data: CommissionTierUpdatePayload }) =>
      updateCommissionTier(tierId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['commission-tiers']);
      },
    }
  );
};

export const useDeleteCommissionTier = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCommissionTier, {
    onSuccess: () => {
      queryClient.invalidateQueries(['commission-tiers']);
    },
  });
};

export const useAdminProviderPackages = (params?: { is_active?: boolean; page?: number; limit?: number }) =>
  useQuery(['provider-packages-admin', params], () => getAdminProviderPackages(params || { page: 1, limit: 100 }));

export const useCreateProviderPackage = () => {
  const queryClient = useQueryClient();
  return useMutation(createProviderPackage, {
    onSuccess: () => {
      queryClient.invalidateQueries(['provider-packages-admin']);
    },
  });
};

export const useUpdateProviderPackage = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ packageId, data }: { packageId: string; data: ProviderPackageUpdatePayload }) =>
      updateProviderPackage(packageId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['provider-packages-admin']);
      },
    }
  );
};

export const useDeleteProviderPackage = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteProviderPackage, {
    onSuccess: () => {
      queryClient.invalidateQueries(['provider-packages-admin']);
    },
  });
};
