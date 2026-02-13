/**
 * Services Barrel Export
 * 
 * Central export point for all service modules
 */

// User Services
export * from './user.service';
export * from './user.types';
export * from './user.hooks';

// Provider Services
export * from './provider.service';
export type { IProvider, IProviderDetail, IGetProvidersParams, IGetProvidersResponse, ICreateProviderRequest, ICreateProviderResponse, IUpdateProviderStatusRequest, IRejectProviderRequest } from './provider.types';
export * from './provider.hooks';

// Booking Services
export * from './booking.service';
export type { IBooking, IBookingDetail, IGetBookingsParams, IGetBookingsResponse, BookingStatus } from './booking.types';
export * from './booking.hooks';

// Category Services
export * from './category.service';
// export * from './category.types';
export * from './category.hooks';

// Sub-Service Services
export * from './subservice.service';
// export * from './subservice.types';
export * from './subservice.hooks';

// Service Services
export * from './service.service';
// export * from './service.types';
export * from './service.hooks';

// Add-On Services
export * from './addon.service';
// export * from './addon.types';
export * from './addon.hooks';

// Coupon Services
export * from './coupon.service';
// export * from './coupon.types';
export * from './coupon.hooks';

// policy service 
export * from './policy.service';
// export * from './policy.types' ;
export * from './policy.hooks';

// template service 
export * from './template.service';
// export * from './template.types';
export * from './template.hooks';

// Role Services
export * from './role.service';
export type { IRole, IPermissionModule, IPermissionAction, IGetRolesParams, IGetRolesResponse, IGetPermissionsResponse, ICreateRoleRequest, ICreateRoleResponse, IUpdateRoleRequest, IDeleteRoleResponse } from './role.types';
export * from './role.hooks';

// Settings Services
export * from './settings.service';
export type { ISystemSettings, IUpdateSettingsRequest, IGetSettingsResponse, IUpdateSettingsResponse, ISystemLog, IGetSystemLogsParams, IGetSystemLogsResponse } from './settings.types';
export * from './settings.hooks';

// Dashboard Services
export * from './dashboard.service';
export * from './dashboard.types';
export * from './dashboard.hooks';

// Payment Services
export * from './payment.service';
export type { IPaymentTransaction, IPaymentDetail, IGetPaymentTransactionsParams, IGetPaymentTransactionsResponse, IRevenueStats, IRevenueByGateway, PaymentStatus } from './payment.types';
export * from './payment.hooks';

// Payout Services
export * from './payout.service';
export type { IPayout, IGetPayoutsParams, IGetPayoutsResponse, IPayoutStats } from './payout.types';
export * from './payout.hooks';

// Profile Services
export * from './profile.service';
export type { IAdminProfile, IGetAdminProfileResponse, IUpdateAdminProfileRequest, IUpdateAdminProfileResponse } from './profile.types';
export * from './profile.hooks';

// Banner Services
export * from './banner.service';
export * from './serviceCost.service';
export type { IBanner, IGetBannersParams, IGetBannersResponse, IGetBannerDetailResponse, ICreateBannerRequest, ICreateBannerResponse, IUpdateBannerRequest, IUpdateBannerResponse, IDeleteBannerResponse, IPaginationMeta } from './banner.types';
export * from './banner.hooks';

// Sub-Banner Services
export * from './subBanner.service';
export type { ISubBanner, IGetSubBannersParams, IGetSubBannersResponse, IGetSubBannerDetailResponse, ICreateSubBannerRequest, ICreateSubBannerResponse, IUpdateSubBannerRequest, IUpdateSubBannerResponse, IDeleteSubBannerResponse, IBannerSettings, IUpdateBannerSettingsRequest, IBannerSettingsResponse } from './subBanner.types';
export * from './subBanner.hooks';

// MEP Banner Services
export * from './mepBanner.service';
export type { IMEPBanner, IGetMEPBannersParams, IGetMEPBannersResponse, IGetMEPBannerDetailResponse, ICreateMEPBannerRequest, ICreateMEPBannerResponse, IUpdateMEPBannerRequest, IUpdateMEPBannerResponse, IDeleteMEPBannerResponse, IMEPBannerSettings, IUpdateMEPBannerSettingsRequest, MEPBannerType } from './mepBanner.types';
export * from './mepBanner.hooks';

// MEP Services
export * from './mep.service';
export * from './mep.types';
export * from './mep.hooks';