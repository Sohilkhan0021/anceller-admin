import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getServiceAreas,
  getServiceAreaById,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
  assignServiceAreaToProvider,
  removeServiceAreaFromProvider,
} from './serviceArea.service';
import type {
  IServiceArea,
  IGetServiceAreasParams,
  IGetServiceAreasResponse,
  IGetServiceAreaDetailResponse,
  ICreateServiceAreaRequest,
  IUpdateServiceAreaRequest,
  IAssignServiceAreaRequest,
  IRemoveServiceAreaRequest,
} from './serviceArea.types';

export const useServiceAreas = (params: IGetServiceAreasParams = {}) => {
  return useQuery<IGetServiceAreasResponse, Error>(
    ['service-areas', params],
    () => getServiceAreas(params),
    {
      keepPreviousData: true,
    }
  );
};

export const useServiceAreaDetail = (areaId: string | null) => {
  return useQuery<IGetServiceAreaDetailResponse, Error>(
    ['service-area', areaId],
    () => getServiceAreaById(areaId as string),
    {
      enabled: !!areaId,
    }
  );
};

export const useCreateServiceArea = (options?: {
  onSuccess?: (data: IServiceArea) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<IServiceArea, Error, ICreateServiceAreaRequest>(
    (data) => createServiceArea(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['service-areas']);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    }
  );
};

export const useUpdateServiceArea = (options?: {
  onSuccess?: (data: IServiceArea) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<
    IServiceArea,
    Error,
    { areaId: string; data: IUpdateServiceAreaRequest }
  >(
    ({ areaId, data }) => updateServiceArea(areaId, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['service-areas']);
        queryClient.invalidateQueries(['service-area', data.area_id]);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    }
  );
};

export const useDeleteServiceArea = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>(
    (areaId) => deleteServiceArea(areaId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['service-areas']);
        options?.onSuccess?.();
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    }
  );
};

export const useAssignServiceArea = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { areaId: string; data: IAssignServiceAreaRequest }>(
    ({ areaId, data }) => assignServiceAreaToProvider(areaId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['service-areas']);
        options?.onSuccess?.();
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    }
  );
};

export const useRemoveServiceArea = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { areaId: string; data: IRemoveServiceAreaRequest }>(
    ({ areaId, data }) => removeServiceAreaFromProvider(areaId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['service-areas']);
        options?.onSuccess?.();
      },
      onError: (error) => {
        options?.onError?.(error);
      },
    }
  );
};

