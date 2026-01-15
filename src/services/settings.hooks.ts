import { useQuery, useMutation, useQueryClient } from 'react-query';
import { settingsService } from './settings.service';
import type {
  IUpdateSettingsRequest,
  IGetSystemLogsParams
} from './settings.types';

/**
 * Hook to fetch system settings
 */
export const useSettings = () => {
  return useQuery(
    ['settings'],
    () => settingsService.getSettings(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
    }
  );
};

/**
 * Hook to update system settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (settings: IUpdateSettingsRequest) => settingsService.updateSettings(settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['settings']);
      },
    }
  );
};

/**
 * Hook to test integration connection
 */
export const useTestIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (integrationType: 'otp_service' | 'payment_gateway' | 'payout_service' | 'maps_api') =>
      settingsService.testIntegration(integrationType),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['settings']);
      },
    }
  );
};

/**
 * Hook to refresh all integration statuses
 */
export const useRefreshIntegrationStatuses = () => {
  const queryClient = useQueryClient();

  return useMutation(
    () => settingsService.refreshIntegrationStatuses(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['settings']);
      },
    }
  );
};

/**
 * Hook to fetch system logs
 */
export const useSystemLogs = (params: IGetSystemLogsParams = {}) => {
  return useQuery(
    ['systemLogs', params],
    () => settingsService.getSystemLogs(params),
    {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchInterval: 60 * 1000, // Auto-refresh every minute
    }
  );
};

