import axios from 'axios';
import { API_URL } from '@/config/api.config';

const ADMIN_BASE = `${API_URL}/admin`;

export interface ICommissionTier {
  tier_id: string;
  public_id: string;
  tier_name: string;
  tier_level: number;
  commission_rate: number;
  minimum_wallet: number;
  /** Minimum partner rating (e.g. 4.5) — optional eligibility hint */
  min_rating?: number | null;
  /** Minimum completed jobs required to qualify for this tier */
  min_jobs_completed?: number;
  /** Gold-style priority in allocation */
  priority_allocation?: boolean;
  /** Commission plan cycle length (days), default 30 */
  plan_validity_days?: number;
  description?: string | null;
  /** Whether tier is currently selectable */
  is_active: boolean;
  /** Whether this tier is considered the default starting tier */
  is_default?: boolean;
}

/** POST /admin/provider-commission-tiers body — same keys as admin Joi + billing UI */
export type CommissionTierCreatePayload = {
  tier_name: string;
  tier_level: number;
  commission_rate: number;
  minimum_wallet: number;
  min_rating?: number | null;
  min_jobs_completed?: number;
  priority_allocation?: boolean;
  plan_validity_days?: number;
  description?: string | null;
  is_active?: boolean;
  is_default?: boolean;
};

/** PUT /admin/provider-commission-tiers/:id — all fields optional */
export type CommissionTierUpdatePayload = Partial<CommissionTierCreatePayload>;

export interface IProviderPackage {
  package_id: string;
  public_id: string;
  package_name: string;
  monthly_fee: number;
  lead_quota: number;
  /** MG plan window in days (e.g. 30 vs 15) */
  validity_days: number;
  carry_forward_percentage: number;
  description?: string | null;
  is_active: boolean;
  active_subscriptions_count?: number;
}

export interface IProviderPackagesListResponse {
  packages: IProviderPackage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** POST /admin/provider-packages body — same keys as admin Joi + billing UI */
export type ProviderPackageCreatePayload = {
  package_name: string;
  monthly_fee: number;
  lead_quota: number;
  validity_days?: number;
  carry_forward_percentage?: number;
  description?: string | null;
  is_active?: boolean;
};

/** PUT /admin/provider-packages/:id body — all fields optional */
export type ProviderPackageUpdatePayload = Partial<ProviderPackageCreatePayload>;

export const getCommissionTiers = async (): Promise<ICommissionTier[]> => {
  const res = await axios.get<{ status: number; data: ICommissionTier[] }>(
    `${ADMIN_BASE}/provider-commission-tiers`
  );
  return res.data.data;
};

export const createCommissionTier = async (
  data: CommissionTierCreatePayload
): Promise<ICommissionTier> => {
  const res = await axios.post<{ status: number; data: ICommissionTier }>(
    `${ADMIN_BASE}/provider-commission-tiers`,
    data
  );
  return res.data.data;
};

export const updateCommissionTier = async (
  tierId: string,
  data: CommissionTierUpdatePayload
): Promise<ICommissionTier> => {
  const res = await axios.put<{ status: number; data: ICommissionTier }>(
    `${ADMIN_BASE}/provider-commission-tiers/${tierId}`,
    data
  );
  return res.data.data;
};

export const deleteCommissionTier = async (tierId: string): Promise<void> => {
  await axios.delete(`${ADMIN_BASE}/provider-commission-tiers/${tierId}`);
};

export const getAdminProviderPackages = async (params: {
  is_active?: boolean;
  page?: number;
  limit?: number;
} = {}): Promise<IProviderPackagesListResponse> => {
  const res = await axios.get<{ status: number; data: IProviderPackagesListResponse }>(
    `${ADMIN_BASE}/provider-packages`,
    { params }
  );
  return res.data.data;
};

export const createProviderPackage = async (
  data: ProviderPackageCreatePayload
): Promise<IProviderPackage> => {
  const res = await axios.post<{ status: number; data: IProviderPackage }>(
    `${ADMIN_BASE}/provider-packages`,
    data
  );
  return res.data.data;
};

export const updateProviderPackage = async (
  packageId: string,
  data: ProviderPackageUpdatePayload
): Promise<IProviderPackage> => {
  const res = await axios.put<{ status: number; data: IProviderPackage }>(
    `${ADMIN_BASE}/provider-packages/${packageId}`,
    data
  );
  return res.data.data;
};

export const deleteProviderPackage = async (packageId: string): Promise<IProviderPackage> => {
  const res = await axios.delete<{ status: number; data: IProviderPackage }>(
    `${ADMIN_BASE}/provider-packages/${packageId}`
  );
  return res.data.data;
};
