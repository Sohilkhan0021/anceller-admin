/**
 * Settings Types
 * Type definitions for system settings API
 */

export interface IIntegrationSettings {
  provider: string;
  api_key: string | null;
  status: 'connected' | 'disconnected' | 'error';
  last_tested: string | null;
  webhook_url: string | null;
  environment?: string;
}

export interface IGeneralSettings {
  app_name: string;
  app_version: string;
  support_email: string;
  support_phone: string;
  timezone: string;
  currency: string;
  language: string;
}

export interface IBusinessSettings {
  tax_rate: number;
  service_charge_rate: number;
  min_order_amount: number;
  max_order_amount: number;
  cancellation_policy: 'flexible' | 'moderate' | 'strict';
}

export interface INotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
}

export interface ISecuritySettings {
  session_timeout: number;
  max_login_attempts: number;
  password_min_length: number;
  require_2fa: boolean;
}

export interface ISystemSettings {
  general: IGeneralSettings;
  integrations: {
    otp_service: IIntegrationSettings;
    payment_gateway: IIntegrationSettings;
    payout_service: IIntegrationSettings;
    maps_api: IIntegrationSettings;
  };
  business: IBusinessSettings;
  notifications: INotificationSettings;
  security: ISecuritySettings;
}

export interface IGetSettingsResponse {
  success: boolean;
  message: string;
  data: ISystemSettings;
}

export interface IUpdateSettingsRequest {
  general?: Partial<IGeneralSettings>;
  integrations?: {
    otp_service?: Partial<IIntegrationSettings>;
    payment_gateway?: Partial<IIntegrationSettings>;
    payout_service?: Partial<IIntegrationSettings>;
    maps_api?: Partial<IIntegrationSettings>;
  };
  business?: Partial<IBusinessSettings>;
  notifications?: Partial<INotificationSettings>;
  security?: Partial<ISecuritySettings>;
}

export interface IUpdateSettingsResponse {
  success: boolean;
  message: string;
  data: ISystemSettings;
}

export interface ITestIntegrationResponse {
  success: boolean;
  message: string;
  data: {
    integration_type: string;
    status: 'success' | 'failed';
    response_time_ms: number;
    last_tested: string;
    message: string;
  };
}

export interface ISystemLog {
  id: string;
  log_id?: string; // Alias for id
  timestamp: string;
  service: string;
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  details: string | null;
  status: string;
  user?: {
    user_id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  entity_type?: string;
  entity_id?: string;
  action?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface IGetSystemLogsParams {
  page?: number;
  limit?: number;
  level?: 'error' | 'warning' | 'info' | 'success';
  service?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface IGetSystemLogsResponse {
  success: boolean;
  message: string;
  data: {
    logs: ISystemLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface IApiError {
  success: false;
  message: string;
  error?: any;
}

