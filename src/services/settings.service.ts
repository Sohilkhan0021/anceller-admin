import axios from 'axios';
import type {
  IGetSettingsResponse,
  IUpdateSettingsRequest,
  IUpdateSettingsResponse,
  ITestIntegrationResponse,
  IGetSystemLogsParams,
  IGetSystemLogsResponse,
  IApiError
} from './settings.types';

const SETTINGS_BASE_URL = '/api/v1/admin/settings';

/**
 * Get system settings
 * 
 * @returns Promise resolving to system settings
 */
export const getSettings = async (): Promise<IGetSettingsResponse['data']> => {
  try {
    const response = await axios.get<IGetSettingsResponse>(SETTINGS_BASE_URL);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching settings',
      };
      throw new Error(apiError.message || 'Failed to fetch settings');
    }
    throw new Error('An unexpected error occurred while fetching settings');
  }
};

/**
 * Update system settings
 * 
 * @param settings - Settings to update (partial)
 * @returns Promise resolving to updated settings
 */
export const updateSettings = async (
  settings: IUpdateSettingsRequest
): Promise<IUpdateSettingsResponse['data']> => {
  try {
    const response = await axios.put<IUpdateSettingsResponse>(
      SETTINGS_BASE_URL,
      settings
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while updating settings',
      };
      throw new Error(apiError.message || 'Failed to update settings');
    }
    throw new Error('An unexpected error occurred while updating settings');
  }
};

/**
 * Test integration connection
 * 
 * @param integrationType - Type of integration to test
 * @returns Promise resolving to test result
 */
export const testIntegration = async (
  integrationType: 'otp_service' | 'payment_gateway' | 'payout_service' | 'maps_api'
): Promise<ITestIntegrationResponse['data']> => {
  try {
    const response = await axios.post<ITestIntegrationResponse>(
      `${SETTINGS_BASE_URL}/integrations/${integrationType}/test`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while testing integration',
      };
      throw new Error(apiError.message || 'Failed to test integration');
    }
    throw new Error('An unexpected error occurred while testing integration');
  }
};

/**
 * Get system logs
 * 
 * @param params - Query parameters for filtering logs
 * @returns Promise resolving to system logs
 */
export const getSystemLogs = async (
  params: IGetSystemLogsParams = {}
): Promise<IGetSystemLogsResponse['data']> => {
  try {
    const response = await axios.get<IGetSystemLogsResponse>(
      `${SETTINGS_BASE_URL}/logs`,
      { params }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching system logs',
      };
      throw new Error(apiError.message || 'Failed to fetch system logs');
    }
    throw new Error('An unexpected error occurred while fetching system logs');
  }
};

/**
 * Settings Service Object
 * 
 * Centralized service object for all settings-related operations
 */
export const settingsService = {
  getSettings,
  updateSettings,
  testIntegration,
  getSystemLogs
};

