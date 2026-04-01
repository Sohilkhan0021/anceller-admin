/**
 * Onboarding Kit Assets Service (Admin)
 * GET/POST training kit and service kit images
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';

const ADMIN_BASE = `${API_URL}/admin`;

export interface IOnboardingKitAssets {
  training_kit_image_url: string | null;
  service_kit_image_url: string | null;
}

export interface IOnboardingKitSection {
  title: string;
  description: string;
  details: string[];
  is_enabled: boolean;
  image_url: string | null;
}

export interface IOnboardingKitContent {
  training_kit: IOnboardingKitSection;
  service_kit: IOnboardingKitSection;
}

export const getOnboardingKitAssets = async (): Promise<IOnboardingKitAssets> => {
  const response = await axios.get<{ status: number; data: IOnboardingKitAssets }>(
    `${ADMIN_BASE}/onboarding-kit-assets`
  );
  return response.data.data;
};

export const updateOnboardingKitAssets = async (
  files: { training_kit_image?: File; service_kit_image?: File }
): Promise<IOnboardingKitAssets> => {
  const formData = new FormData();
  if (files.training_kit_image) formData.append('training_kit_image', files.training_kit_image);
  if (files.service_kit_image) formData.append('service_kit_image', files.service_kit_image);
  const response = await axios.post<{ status: number; data: IOnboardingKitAssets }>(
    `${ADMIN_BASE}/onboarding-kit-assets`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  return response.data.data;
};

export const deleteOnboardingKitAsset = async (
  assetType: 'training_kit' | 'service_kit'
): Promise<void> => {
  await axios.delete(`${ADMIN_BASE}/onboarding-kit-assets/${assetType}`);
};

export const getOnboardingKitContent = async (): Promise<IOnboardingKitContent> => {
  const response = await axios.get<{ status: number; data: IOnboardingKitContent }>(
    `${ADMIN_BASE}/onboarding-kit-content`
  );
  return response.data.data;
};

export const updateOnboardingKitContent = async (
  data: Partial<IOnboardingKitContent>
): Promise<IOnboardingKitContent> => {
  const response = await axios.put<{ status: number; data: IOnboardingKitContent }>(
    `${ADMIN_BASE}/onboarding-kit-content`,
    data
  );
  return response.data.data;
};
