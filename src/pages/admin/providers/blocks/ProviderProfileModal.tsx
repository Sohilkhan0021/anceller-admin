import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabPanel, TabsList, Tab } from '@/components/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  getProviderPackages,
  useCommissionTiers,
  useProvider,
  useUpdateProviderStatus,
  useVerifyKycDocument,
  useProviderOnboarding,
  useProviderEarningsDashboard,
  useProviderJobs,
  useProviderWallet,
  useProviderBillingModel,
  useAssignTraining,
  useMarkTrainingCompleted,
  useScheduleKitDelivery,
  useMarkKitDelivered,
  useUpdateOnboardingPayment,
  useUpdateProviderBillingModel,
  useProviderOnboardingPayments,
  useCreateProviderOnboardingPayment,
  useMarkProviderOnboardingPaymentPaid,
  useAdjustProviderWallet
} from '@/services';
import { formatAmount } from '@/utils/currency';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { toast } from 'sonner';

/** Map backend payout_status to display label; fallback for missing/unrecognized (bug fix: earnings status) */
const getEarningsStatusLabel = (status: string | null | undefined): string => {
  if (status == null || status === '') return 'Unknown';
  const u = String(status).toUpperCase();
  if (u === 'PAID' || u === 'COMPLETED') return 'Paid';
  if (u === 'PENDING') return 'Pending';
  if (u === 'PROCESSING') return 'Processing';
  if (u === 'FAILED') return 'Failed';
  return 'Unknown';
};

interface IProviderProfileModalProps {
  provider: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProviderProfileModal = ({ provider, isOpen, onClose }: IProviderProfileModalProps) => {
  const providerId = provider?.id || provider?.provider_id || null;
  const {
    provider: providerDetail,
    isLoading,
    isError,
    error,
    refetch
  } = useProvider(providerId, {
    enabled: isOpen && !!providerId
  });

  const { onboarding, isLoading: isLoadingOnboarding } = useProviderOnboarding(providerId, {
    enabled: isOpen && !!providerId
  });

  // Provider earnings, jobs, wallet and billing data (admin view)
  const {
    data: earningsDashboard,
    isLoading: isLoadingEarnings,
    isError: isErrorEarnings
  } = useProviderEarningsDashboard(providerId, {
    enabled: isOpen && !!providerId
  });

  const {
    data: jobsData,
    isLoading: isLoadingJobs,
    isError: isErrorJobs
  } = useProviderJobs(
    providerId,
    { page: 1, limit: 20 },
    {
      enabled: isOpen && !!providerId
    }
  );

  const {
    data: walletData,
    isLoading: isLoadingWallet,
    isError: isErrorWallet
  } = useProviderWallet(providerId, {
    enabled: isOpen && !!providerId
  });

  const {
    data: billingData,
    isLoading: isLoadingBilling,
    isError: isErrorBilling
  } = useProviderBillingModel(providerId, {
    enabled: isOpen && !!providerId
  });
  const { data: commissionTiers } = useCommissionTiers();
  const { data: packagesData } = useQuery(['provider-packages-for-provider-modal'], () =>
    getProviderPackages({ is_active: true, page: 1, limit: 100 })
  );
  const { data: onboardingPaymentsData } = useProviderOnboardingPayments(
    providerId,
    { page: 1, limit: 20 },
    { enabled: isOpen && !!providerId }
  );

  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [rejectDocumentDialogOpen, setRejectDocumentDialogOpen] = useState(false);
  const [rejectDocumentReason, setRejectDocumentReason] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(null);
  const [isOnboardingActionLoading, setIsOnboardingActionLoading] = useState(false);
  const [trainingScheduledDate, setTrainingScheduledDate] = useState('');
  const [trainingScheduledTime, setTrainingScheduledTime] = useState('');
  const [trainingLocation, setTrainingLocation] = useState('');
  const [kitScheduledDate, setKitScheduledDate] = useState('');
  const [kitScheduledTime, setKitScheduledTime] = useState('');
  const [kitHubLocation, setKitHubLocation] = useState('');
  const [kitHubAddress, setKitHubAddress] = useState('');
  const [billingPlanId, setBillingPlanId] = useState('');
  const billingPlanOptions = [
    ...((commissionTiers || [])
      .filter((tier: any) => tier.is_active)
      .map((tier: any) => ({
        value: tier.public_id,
        label: `${tier.tier_name} (Commission) - ${tier.public_id}`
      })) || []),
    ...((packagesData?.packages || [])
      .filter((pkg: any) => pkg.is_active)
      .map((pkg: any) => ({
        value: pkg.public_id,
        label: `${pkg.package_name} (Package) - ${pkg.public_id}`
      })) || [])
  ];

  const [feeType, setFeeType] = useState<'REGISTRATION' | 'TRAINING' | 'KIT'>('REGISTRATION');
  const [manualPaymentAmount, setManualPaymentAmount] = useState('');
  const [manualPaymentMethod, setManualPaymentMethod] = useState('upi');
  const [manualTxnRef, setManualTxnRef] = useState('');
  const [manualRemarks, setManualRemarks] = useState('');
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpDescription, setTopUpDescription] = useState('');

  const adjustWalletMutation = useAdjustProviderWallet({
    onSuccess: () => {
      toast.success('Wallet topped up successfully');
      setTopUpModalOpen(false);
      setTopUpAmount('');
      setTopUpDescription('');
    },
    onError: (err: any) => {
      // Bug fix: surface backend message so top-up failures are visible on UI.
      const msg = err?.response?.data?.message || err?.message || 'Top-up failed';
      toast.error(msg);
    }
  });

  const verifyKycMutation = useVerifyKycDocument({
    onSuccess: (data) => {
      toast.success((data as any).message || 'KYC document updated successfully');
      setLoadingDocumentId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update KYC document');
      setLoadingDocumentId(null);
    }
  });

  const updateStatusMutation = useUpdateProviderStatus({
    onSuccess: (data) => {
      toast.success((data as any).message || 'Provider status updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update provider status');
    }
  });

  // Use detailed provider data if available, otherwise fall back to basic provider data
  const displayProvider = providerDetail || provider;

  // Extract data from API response - preserve full document data including file_url
  // Map verification_status: PENDING -> pending, VERIFIED -> verified, REJECTED -> rejected
  const kycDocuments = (displayProvider?.kyc?.documents || []).map((doc: any) => {
    const verificationStatus = doc.verification_status || doc.status || 'PENDING';
    const statusMap: { [key: string]: string } = {
      PENDING: 'pending',
      VERIFIED: 'verified',
      REJECTED: 'rejected',
      pending: 'pending',
      verified: 'verified',
      rejected: 'rejected'
    };
    return {
      type: doc.document_type || 'Unknown',
      status: statusMap[verificationStatus.toUpperCase()] || 'pending',
      uploadDate: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A',
      verifiedDate: doc.verified_at ? new Date(doc.verified_at).toLocaleDateString() : null,
      documentNumber: doc.document_id || doc.public_id || 'N/A',
      document_id: doc.document_id || doc.public_id,
      file_url: doc.file_url || doc.fileUrl || doc.url || null,
      rejection_reason: doc.rejection_reason || null,
      originalDoc: doc // Preserve full original document data
    };
  });

  const resolvedKycStatus = (() => {
    const rawStatus = [
      displayProvider?.kyc_status,
      displayProvider?.kycStatus,
      displayProvider?.verification_status,
      displayProvider?.kyc?.status
    ].find((value) => typeof value === 'string' && value.trim() !== '');

    if (rawStatus) {
      return rawStatus.toLowerCase();
    }

    if (displayProvider?.isVerified === true || displayProvider?.is_verified === true) {
      return 'verified';
    }

    if (kycDocuments.length > 0) {
      if (kycDocuments.some((doc: any) => doc.status === 'rejected')) return 'rejected';
      if (kycDocuments.some((doc: any) => doc.status === 'pending')) return 'pending';
      if (kycDocuments.every((doc: any) => doc.status === 'verified')) return 'verified';
    }

    return 'pending';
  })();

  // Prefer admin-managed service_areas from provider profile if available
  const serviceZones = Array.isArray((displayProvider as any)?.service_areas)
    ? (displayProvider as any).service_areas.map((area: any) => ({
        zone: area.area_name || area.name || 'Service Area',
        status: area.is_active ? 'active' : 'inactive',
        jobsCompleted: displayProvider?.completed_jobs || 0,
        zone_id: area.area_id || area.public_id,
        city: area.city,
        state: area.state,
        radius_km: area.radius_km
      }))
    : (displayProvider?.zones || []).map((zone: any) => ({
        zone: zone.name || 'Unknown Zone',
        status: 'active',
        jobsCompleted: 0,
        zone_id: zone.zone_id || zone.public_id
      }));

  const reviews = (displayProvider?.recent_reviews || []).map((review: any) => ({
    id: review.review_id || 'N/A',
    customerName: review.user_name || 'Anonymous',
    rating: review.rating || 0,
    comment: review.comment || 'No comment',
    date: review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A',
    service: 'Service', // This would need to come from the order/service data
    order_id: review.order_id
  }));

  const onboardingStatus =
    onboarding?.onboarding_status || displayProvider?.onboarding_status || 'PENDING';

  const assignTrainingMutation = useAssignTraining({
    onSuccess: () => {
      toast.success('Training scheduled successfully');
      setIsOnboardingActionLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to schedule training');
      setIsOnboardingActionLoading(false);
    }
  });

  const markTrainingCompletedMutation = useMarkTrainingCompleted({
    onSuccess: () => {
      toast.success('Training marked as completed');
      setIsOnboardingActionLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark training as completed');
      setIsOnboardingActionLoading(false);
    }
  });

  const scheduleKitDeliveryMutation = useScheduleKitDelivery({
    onSuccess: () => {
      toast.success('Kit delivery scheduled successfully');
      setIsOnboardingActionLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to schedule kit delivery');
      setIsOnboardingActionLoading(false);
    }
  });

  const markKitDeliveredMutation = useMarkKitDelivered({
    onSuccess: () => {
      toast.success('Kit marked as delivered');
      setIsOnboardingActionLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark kit as delivered');
      setIsOnboardingActionLoading(false);
    }
  });

  const updateOnboardingPaymentMutation = useUpdateOnboardingPayment({
    onSuccess: () => {
      toast.success('Payment status updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update payment status');
    }
  });

  const updateProviderBillingMutation = useUpdateProviderBillingModel({
    onSuccess: () => {
      toast.success('Billing plan assigned successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to assign billing plan');
    }
  });
  const createOnboardingPaymentMutation = useCreateProviderOnboardingPayment({
    onSuccess: () => {
      toast.success('Onboarding payment entry created');
      setManualPaymentAmount('');
      setManualTxnRef('');
      setManualRemarks('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create onboarding payment entry');
    }
  });
  const markOnboardingPaymentPaidMutation = useMarkProviderOnboardingPaymentPaid({
    onSuccess: () => {
      toast.success('Payment marked as paid');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark payment as paid');
    }
  });

  const handleAssignTraining = () => {
    if (!providerId) {
      toast.error('Provider ID is missing');
      return;
    }
    if (!trainingScheduledDate) {
      toast.error('Please select a training date');
      return;
    }
    setIsOnboardingActionLoading(true);
    assignTrainingMutation.mutate({
      providerId,
      data: {
        scheduled_date: trainingScheduledDate,
        scheduled_time: trainingScheduledTime || null,
        location: trainingLocation || null
      }
    });
  };

  const handleSetOnboardingFeeAmount = (
    field: 'registration_fee_amount' | 'training_fee_amount' | 'kit_fee_amount',
    currentAmount?: number
  ) => {
    if (!providerId) return;
    const value = window.prompt('Enter fee amount', String(currentAmount ?? 0));
    if (value === null) return;
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error('Please enter a valid non-negative amount');
      return;
    }
    updateOnboardingPaymentMutation.mutate({
      providerId,
      data: { [field]: amount } as any
    });
  };

  const handleCreateManualOnboardingPayment = (markAsPaid: boolean) => {
    if (!providerId) return;
    const parsedAmount = manualPaymentAmount ? Number(manualPaymentAmount) : undefined;
    if (parsedAmount !== undefined && (!Number.isFinite(parsedAmount) || parsedAmount <= 0)) {
      toast.error('Amount must be a valid number greater than 0');
      return;
    }
    createOnboardingPaymentMutation.mutate({
      providerId,
      data: {
        fee_type: feeType,
        amount: parsedAmount,
        mark_as_paid: markAsPaid,
        payment_method: manualPaymentMethod,
        transaction_reference: manualTxnRef || undefined,
        remarks: manualRemarks || undefined
      } as any
    });
  };

  const handleMarkTrainingCompleted = () => {
    if (!providerId) {
      toast.error('Provider ID is missing');
      return;
    }
    setIsOnboardingActionLoading(true);
    markTrainingCompletedMutation.mutate({
      providerId,
      data: {}
    });
  };

  const handleScheduleKitDelivery = () => {
    if (!providerId) {
      toast.error('Provider ID is missing');
      return;
    }
    if (!kitScheduledDate) {
      toast.error('Please select a kit delivery date');
      return;
    }
    setIsOnboardingActionLoading(true);
    scheduleKitDeliveryMutation.mutate({
      providerId,
      data: {
        scheduled_date: kitScheduledDate,
        scheduled_time: kitScheduledTime || null,
        hub_location: kitHubLocation || null,
        hub_address: kitHubAddress || null
      }
    });
  };

  const handleMarkKitDelivered = () => {
    if (!providerId) {
      toast.error('Provider ID is missing');
      return;
    }
    setIsOnboardingActionLoading(true);
    markKitDeliveredMutation.mutate({
      providerId,
      data: {}
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { variant: 'success', text: 'Verified', className: '' },
      pending: { variant: 'warning', text: 'Pending', className: '' },
      rejected: { variant: 'destructive', text: 'Rejected', className: '' },
      active: { variant: 'success', text: 'Active', className: '' },
      inactive: {
        variant: 'secondary',
        text: 'Inactive',
        className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-medium'
      },
      available: { variant: 'success', text: 'Available', className: '' },
      unavailable: { variant: 'destructive', text: 'Unavailable', className: '' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'outline',
      text: status || 'Inactive',
      className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-medium'
    };
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <KeenIcon
          key={i}
          icon={i < rating ? 'star' : 'star'}
          className={`text-sm ${i < rating ? 'text-warning' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  const handleApproveKYCDocument = (documentId: string) => {
    if (!documentId) {
      toast.error('Document ID is missing');
      return;
    }

    setLoadingDocumentId(documentId);
    try {
      verifyKycMutation.mutate({
        documentId,
        data: {
          action: 'approve'
        }
      });
    } catch (error) {
      console.error('[APPROVE] Error calling mutation:', error);
      setLoadingDocumentId(null);
    }
  };

  const handleRejectKYCDocument = (documentId: string) => {
    if (!documentId) {
      toast.error('Document ID is missing');
      return;
    }
    setSelectedDocumentId(documentId);
    setRejectDocumentDialogOpen(true);
  };

  const handleConfirmRejectDocument = () => {
    if (!selectedDocumentId || !rejectDocumentReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setLoadingDocumentId(selectedDocumentId);
    try {
      verifyKycMutation.mutate({
        documentId: selectedDocumentId,
        data: {
          action: 'reject',
          rejection_reason: rejectDocumentReason.trim()
        }
      });
      setRejectDocumentDialogOpen(false);
      setRejectDocumentReason('');
      // Don't clear selectedDocumentId here - let onSuccess/onError handle it
    } catch (error) {
      console.error('[REJECT DOCUMENT] Error calling mutation:', error);
      setLoadingDocumentId(null);
    }
  };

  const handleBlockProvider = () => {
    const id = providerId || provider?.id || provider?.provider_id;
    if (!id) {
      toast.error('Provider ID is missing');
      console.error('Provider ID is missing:', { providerId, provider });
      return;
    }
    console.log('Blocking provider:', id);
    updateStatusMutation.mutate({
      providerId: id,
      status: 'SUSPENDED'
    });
  };

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setViewDocumentOpen(true);
  };

  const isImageFile = (url: string | null) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some((ext) => lowerUrl.includes(ext));
  };

  const isPdfFile = (url: string | null) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  const getDisplayValue = (...values: Array<string | null | undefined>) => {
    const value = values.find((item) => {
      if (!item) return false;
      const normalized = item.trim().toLowerCase();
      return (
        normalized !== '' &&
        normalized !== 'n/a' &&
        normalized !== 'null' &&
        normalized !== 'undefined'
      );
    });
    return value || null;
  };

  const providerName =
    getDisplayValue(
      displayProvider?.name,
      displayProvider?.business_name,
      displayProvider?.user?.name
    ) || (providerId ? `Provider ${providerId}` : 'Provider Profile');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="flex items-center gap-3 min-w-0">
            <KeenIcon icon="shop" className="text-primary" />
            <span className="truncate">Provider Profile - {providerName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="px-6 py-8">
            <ContentLoader />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="px-6 py-4">
            <Alert variant="danger">
              {error?.message || 'Failed to load provider details. Please try again.'}
            </Alert>
          </div>
        )}

        {/* Provider Details - Only show if not loading and no error */}
        {!isLoading && !isError && (
          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(92vh-130px)]">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="flex w-full gap-3 overflow-x-auto whitespace-nowrap px-1 py-2">
                <Tab value="personal" className="shrink-0 px-4 py-2">
                  Personal Details
                </Tab>
                <Tab value="onboarding" className="shrink-0 px-4 py-2">
                  Onboarding
                </Tab>
                <Tab value="kyc" className="shrink-0 px-4 py-2">
                  KYC Documents
                </Tab>
                <Tab value="earnings" className="shrink-0 px-4 py-2">
                  Earnings
                </Tab>
                <Tab value="jobs" className="shrink-0 px-4 py-2">
                  Jobs
                </Tab>
                <Tab value="wallet" className="shrink-0 px-4 py-2">
                  Wallet
                </Tab>
                <Tab value="billing" className="shrink-0 px-4 py-2">
                  Billing
                </Tab>
                <Tab value="zones" className="shrink-0 px-4 py-2">
                  Service Zones
                </Tab>
                <Tab value="schedule" className="shrink-0 px-4 py-2">
                  Availability
                </Tab>
                <Tab value="reviews" className="shrink-0 px-4 py-2">
                  Reviews & Ratings
                </Tab>
              </TabsList>

              {/* Personal Details Tab */}
              <TabPanel value="personal" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Personal Details</h3>
                    <p className="text-sm text-muted-foreground">Provider personal information</p>
                  </div>
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Provider Image Section */}
                      <div className="flex-shrink-0 flex items-center justify-center md:items-start">
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-border bg-surface-1">
                          {displayProvider?.profile_picture_url ||
                          displayProvider?.user?.profile_picture_url ||
                          displayProvider?.avatar ? (
                            <img
                              src={
                                displayProvider?.profile_picture_url ||
                                displayProvider?.user?.profile_picture_url ||
                                displayProvider?.avatar
                              }
                              alt={
                                displayProvider?.user?.name || displayProvider?.name || 'Provider'
                              }
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          {!displayProvider?.profile_picture_url &&
                            !displayProvider?.user?.profile_picture_url &&
                            !displayProvider?.avatar && (
                              <KeenIcon icon="user" className="text-5xl text-muted-foreground/70" />
                            )}
                        </div>
                      </div>

                      {/* Personal Details Table */}
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Provider ID
                            </div>
                            <div className="text-sm font-medium">
                              {displayProvider?.provider_id || displayProvider?.id || 'N/A'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Name
                            </div>
                            <div className="text-sm font-medium">
                              {displayProvider?.user?.name ||
                                displayProvider?.name ||
                                displayProvider?.business_name ||
                                'N/A'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Business Name
                            </div>
                            <div className="text-sm">
                              {displayProvider?.business_name || displayProvider?.name || 'N/A'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Email
                            </div>
                            <div className="text-sm">
                              {displayProvider?.user?.email || displayProvider?.email || 'N/A'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Phone
                            </div>
                            <div className="text-sm">
                              {displayProvider?.user?.phone || displayProvider?.phone || 'N/A'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Status
                            </div>
                            <div>
                              {getStatusBadge(
                                (displayProvider?.status || 'inactive').toLowerCase()
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              KYC Status
                            </div>
                            <div>{getStatusBadge(resolvedKycStatus)}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              Joined Date
                            </div>
                            <div className="text-sm">
                              {displayProvider?.joined_at ||
                              displayProvider?.joinDate ||
                              displayProvider?.createdAt
                                ? new Date(
                                    displayProvider?.joined_at ||
                                      displayProvider?.joinDate ||
                                      displayProvider?.createdAt
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Address Section */}
                        {(displayProvider?.address ||
                          displayProvider?.city ||
                          displayProvider?.state ||
                          displayProvider?.pincode ||
                          displayProvider?.country ||
                          (displayProvider?.zones && displayProvider.zones.length > 0)) && (
                          <div className="mt-6 border-t border-border pt-6">
                            <div className="mb-4 text-sm font-medium text-foreground">
                              Address Information
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(displayProvider?.address ||
                                (displayProvider?.zones && displayProvider.zones.length > 0)) && (
                                <div className="space-y-1 md:col-span-2">
                                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Address
                                  </div>
                                  <div className="text-sm">
                                    {displayProvider?.address ||
                                      (displayProvider?.zones && displayProvider.zones.length > 0
                                        ? displayProvider.zones
                                            .map((zone: any) => zone.name)
                                            .join(', ')
                                        : 'N/A')}
                                  </div>
                                </div>
                              )}
                              {displayProvider?.city && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    City
                                  </div>
                                  <div className="text-sm">{displayProvider.city}</div>
                                </div>
                              )}
                              {displayProvider?.state && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    State
                                  </div>
                                  <div className="text-sm">{displayProvider.state}</div>
                                </div>
                              )}
                              {displayProvider?.pincode && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Pincode
                                  </div>
                                  <div className="text-sm">
                                    {displayProvider.pincode || displayProvider.zipCode || 'N/A'}
                                  </div>
                                </div>
                              )}
                              {displayProvider?.country && (
                                <div className="space-y-1">
                                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Country
                                  </div>
                                  <div className="text-sm">{displayProvider.country}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Onboarding Tab */}
              <TabPanel value="onboarding" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header flex items-center justify-between">
                    <div>
                      <h3 className="card-title">Onboarding Status</h3>
                      <p className="text-sm text-gray-600">
                        Registration, training, kit, and verification progress for this provider.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Organization-wide default fees are configured on{' '}
                        <Link
                          to="/admin/onboarding-fee-defaults"
                          className="text-primary underline"
                        >
                          Onboarding fee defaults
                        </Link>
                        . Adjust amounts below for this provider only.
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Current Status
                      </span>
                      <span className="text-sm font-semibold">{onboardingStatus || 'PENDING'}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    {isLoadingOnboarding && (
                      <div className="py-6 text-sm text-gray-500">
                        Loading onboarding details...
                      </div>
                    )}

                    {!isLoadingOnboarding && !onboarding && (
                      <div className="py-6 space-y-4">
                        <div className="text-sm text-gray-500">
                          Onboarding record not initialized yet for this provider. Once initialized
                          from backend, training and kit status will appear here.
                        </div>
                      </div>
                    )}

                    {!isLoadingOnboarding && onboarding && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Registration Fee
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-sm">
                                <span className="font-medium">
                                  {onboarding.checklist.registration_fee.completed
                                    ? 'Paid'
                                    : 'Pending'}
                                </span>
                                {typeof onboarding.checklist.registration_fee.amount ===
                                  'number' && (
                                  <span className="text-gray-600">
                                    {' '}
                                    — {formatAmount(onboarding.checklist.registration_fee.amount)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={updateOnboardingPaymentMutation.isLoading}
                                  onClick={() =>
                                    handleSetOnboardingFeeAmount(
                                      'registration_fee_amount',
                                      onboarding.checklist.registration_fee.amount
                                    )
                                  }
                                >
                                  Set Amount
                                </Button>
                                <Label htmlFor="reg-fee-paid" className="text-sm text-gray-600">
                                  Paid
                                </Label>
                                <Switch
                                  id="reg-fee-paid"
                                  checked={!!onboarding.checklist.registration_fee.completed}
                                  disabled={updateOnboardingPaymentMutation.isLoading}
                                  onCheckedChange={(checked) => {
                                    if (!providerId) return;
                                    updateOnboardingPaymentMutation.mutate({
                                      providerId,
                                      data: { registration_fee_paid: !!checked }
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Training
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="font-medium">
                                  {onboarding.checklist.training.status ||
                                    (onboarding.checklist.training.completed
                                      ? 'Completed'
                                      : 'Not Scheduled')}
                                </span>
                                {onboarding.checklist.training.scheduled_date && (
                                  <span className="text-gray-600">
                                    {' '}
                                    —{' '}
                                    {new Date(
                                      onboarding.checklist.training.scheduled_date
                                    ).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                <Input
                                  type="date"
                                  value={trainingScheduledDate}
                                  onChange={(e) => setTrainingScheduledDate(e.target.value)}
                                />
                                <Input
                                  type="time"
                                  value={trainingScheduledTime}
                                  onChange={(e) => setTrainingScheduledTime(e.target.value)}
                                />
                                <Input
                                  type="text"
                                  placeholder="Location (optional)"
                                  value={trainingLocation}
                                  onChange={(e) => setTrainingLocation(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2 md:mt-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAssignTraining}
                                    disabled={isOnboardingActionLoading}
                                  >
                                    {isOnboardingActionLoading && assignTrainingMutation.isLoading
                                      ? 'Saving...'
                                      : 'Schedule'}
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleMarkTrainingCompleted}
                                    disabled={
                                      isOnboardingActionLoading ||
                                      onboarding.checklist.training.completed
                                    }
                                  >
                                    {onboarding.checklist.training.completed
                                      ? 'Completed'
                                      : 'Mark Completed'}
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
                                <span className="text-sm text-gray-600">Training fee paid</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={updateOnboardingPaymentMutation.isLoading}
                                    onClick={() =>
                                      handleSetOnboardingFeeAmount(
                                        'training_fee_amount',
                                        (onboarding as any).checklist.training.fee_amount
                                      )
                                    }
                                  >
                                    Set Amount
                                  </Button>
                                  <Label
                                    htmlFor="training-fee-paid"
                                    className="text-sm text-gray-600"
                                  >
                                    Paid
                                  </Label>
                                  <Switch
                                    id="training-fee-paid"
                                    checked={!!(onboarding as any).checklist.training.fee_paid}
                                    disabled={updateOnboardingPaymentMutation.isLoading}
                                    onCheckedChange={(checked) => {
                                      if (!providerId) return;
                                      updateOnboardingPaymentMutation.mutate({
                                        providerId,
                                        data: { training_fee_paid: !!checked }
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Kit Fee & Delivery
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="font-medium">
                                  {onboarding.checklist.kit.delivered
                                    ? 'Kit Delivered'
                                    : onboarding.checklist.kit.completed
                                      ? 'Fee Paid, Pending Delivery'
                                      : 'Pending'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                                <Input
                                  type="date"
                                  value={kitScheduledDate}
                                  onChange={(e) => setKitScheduledDate(e.target.value)}
                                />
                                <Input
                                  type="time"
                                  value={kitScheduledTime}
                                  onChange={(e) => setKitScheduledTime(e.target.value)}
                                />
                                <Input
                                  type="text"
                                  placeholder="Hub location (optional)"
                                  value={kitHubLocation}
                                  onChange={(e) => setKitHubLocation(e.target.value)}
                                />
                                <Input
                                  type="text"
                                  placeholder="Hub address (optional)"
                                  value={kitHubAddress}
                                  onChange={(e) => setKitHubAddress(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2 md:mt-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleScheduleKitDelivery}
                                    disabled={
                                      isOnboardingActionLoading ||
                                      !onboarding.checklist.training.completed
                                    }
                                  >
                                    {isOnboardingActionLoading &&
                                    scheduleKitDeliveryMutation.isLoading
                                      ? 'Saving...'
                                      : 'Schedule'}
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleMarkKitDelivered}
                                    disabled={
                                      isOnboardingActionLoading ||
                                      onboarding.checklist.kit.delivered
                                    }
                                  >
                                    {onboarding.checklist.kit.delivered
                                      ? 'Delivered'
                                      : 'Mark Delivered'}
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
                                <span className="text-sm text-gray-600">Kit fee paid</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={updateOnboardingPaymentMutation.isLoading}
                                    onClick={() =>
                                      handleSetOnboardingFeeAmount(
                                        'kit_fee_amount',
                                        (onboarding as any).checklist.kit.fee_amount
                                      )
                                    }
                                  >
                                    Set Amount
                                  </Button>
                                  <Label htmlFor="kit-fee-paid" className="text-sm text-gray-600">
                                    Paid
                                  </Label>
                                  <Switch
                                    id="kit-fee-paid"
                                    checked={!!(onboarding as any).checklist.kit.fee_paid}
                                    disabled={updateOnboardingPaymentMutation.isLoading}
                                    onCheckedChange={(checked) => {
                                      if (!providerId) return;
                                      updateOnboardingPaymentMutation.mutate({
                                        providerId,
                                        data: { kit_fee_paid: !!checked }
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Final Verification
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                {onboarding.checklist.verification.completed
                                  ? 'Verified'
                                  : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 border rounded-lg p-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold">
                              Onboarding Payment Ledger (Admin Manual)
                            </h4>
                            <p className="text-xs text-gray-600">
                              Create pending/paid payment entries and mark pending entries as paid
                              with transaction details.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                            <div>
                              <Label className="text-xs text-gray-600">Fee type</Label>
                              <select
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={feeType}
                                onChange={(e) => setFeeType(e.target.value as any)}
                              >
                                <option value="REGISTRATION">REGISTRATION</option>
                                <option value="TRAINING">TRAINING</option>
                                <option value="KIT">KIT</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Amount (optional)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={manualPaymentAmount}
                                onChange={(e) => setManualPaymentAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Method</Label>
                              <Input
                                type="text"
                                value={manualPaymentMethod}
                                onChange={(e) => setManualPaymentMethod(e.target.value)}
                                placeholder="upi/netbanking/wallet/cash_on_delivery"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Txn Ref</Label>
                              <Input
                                type="text"
                                value={manualTxnRef}
                                onChange={(e) => setManualTxnRef(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Remarks</Label>
                              <Input
                                type="text"
                                value={manualRemarks}
                                onChange={(e) => setManualRemarks(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={createOnboardingPaymentMutation.isLoading}
                              onClick={() => handleCreateManualOnboardingPayment(false)}
                            >
                              Create Pending
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              disabled={createOnboardingPaymentMutation.isLoading}
                              onClick={() => handleCreateManualOnboardingPayment(true)}
                            >
                              Create + Mark Paid
                            </Button>
                          </div>

                          <div className="overflow-x-auto border rounded">
                            <table className="min-w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left px-3 py-2">Fee Type</th>
                                  <th className="text-left px-3 py-2">Amount</th>
                                  <th className="text-left px-3 py-2">Status</th>
                                  <th className="text-left px-3 py-2">Txn Ref</th>
                                  <th className="text-left px-3 py-2">Created</th>
                                  <th className="text-left px-3 py-2">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(onboardingPaymentsData?.payments || []).length === 0 ? (
                                  <tr>
                                    <td className="px-3 py-3 text-gray-500" colSpan={6}>
                                      No onboarding payments found
                                    </td>
                                  </tr>
                                ) : (
                                  (onboardingPaymentsData?.payments || []).map((p: any) => (
                                    <tr key={p.payment_id} className="border-t">
                                      <td className="px-3 py-2">{p.fee_type}</td>
                                      <td className="px-3 py-2">{formatAmount(p.amount)}</td>
                                      <td className="px-3 py-2">{p.payment_status}</td>
                                      <td className="px-3 py-2">
                                        {p.gateway_transaction_id || '-'}
                                      </td>
                                      <td className="px-3 py-2">
                                        {new Date(p.created_at).toLocaleString()}
                                      </td>
                                      <td className="px-3 py-2">
                                        {p.payment_status !== 'SUCCESS' && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={markOnboardingPaymentPaidMutation.isLoading}
                                            onClick={() => {
                                              if (!providerId) return;
                                              markOnboardingPaymentPaidMutation.mutate({
                                                providerId,
                                                paymentId: p.payment_id,
                                                data: {
                                                  payment_method: manualPaymentMethod,
                                                  transaction_reference: manualTxnRef || undefined,
                                                  remarks: manualRemarks || undefined
                                                } as any
                                              });
                                            }}
                                          >
                                            Mark Paid
                                          </Button>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabPanel>

              {/* KYC Documents Tab */}
              <TabPanel value="kyc" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">KYC Documents</h3>
                    <p className="text-sm text-gray-600">Identity and verification documents</p>
                  </div>
                  <div className="card-body p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Upload Date</TableHead>
                          {/* <TableHead>Document Number</TableHead>x  */}
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kycDocuments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No KYC documents found
                            </TableCell>
                          </TableRow>
                        ) : (
                          kycDocuments.map((doc: any, index: number) => (
                            <TableRow key={doc.document_id || index}>
                              <TableCell className="font-medium">{doc.type}</TableCell>
                              <TableCell>{getStatusBadge(doc.status)}</TableCell>
                              <TableCell>{doc.uploadDate}</TableCell>
                              {/* <TableCell>{doc.documentNumber}</TableCell> */}
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewDocument(doc)}
                                  >
                                    <KeenIcon icon="eye" className="me-1" />
                                    View
                                  </Button>
                                  {doc.status === 'pending' && (
                                    <>
                                      <Button
                                        variant="default"
                                        className="bg-success text-white hover:bg-success/90"
                                        size="sm"
                                        onClick={() => handleApproveKYCDocument(doc.document_id)}
                                        disabled={loadingDocumentId !== null}
                                      >
                                        <KeenIcon icon="check" className="me-1" />
                                        {loadingDocumentId === doc.document_id
                                          ? 'Approving...'
                                          : 'Approve'}
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRejectKYCDocument(doc.document_id)}
                                        disabled={loadingDocumentId !== null}
                                      >
                                        <KeenIcon icon="cross" className="me-1" />
                                        {loadingDocumentId === doc.document_id
                                          ? 'Rejecting...'
                                          : 'Reject'}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabPanel>

              {/* Earnings Tab */}
              <TabPanel value="earnings" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Earnings Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      Wallet balance and recent earnings for this provider.
                    </p>
                  </div>
                  <div className="card-body">
                    {isLoadingEarnings && (
                      <div className="py-6 text-sm text-muted-foreground">Loading earnings...</div>
                    )}
                    {isErrorEarnings && !isLoadingEarnings && (
                      <div className="py-6 text-sm text-danger">Failed to load earnings data.</div>
                    )}
                    {!isLoadingEarnings && !isErrorEarnings && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="p-4 rounded-lg border bg-surface-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">
                              Wallet Balance
                            </div>
                            <div className="mt-1 text-xl font-semibold">
                              {formatAmount(earningsDashboard?.wallet_balance ?? 0)}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg border bg-surface-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">
                              Available to Withdraw
                            </div>
                            <div className="mt-1 text-xl font-semibold">
                              {formatAmount(earningsDashboard?.available_withdraw_balance ?? 0)}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg border bg-surface-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">
                              Total Earnings
                            </div>
                            <div className="mt-1 text-xl font-semibold">
                              {formatAmount(earningsDashboard?.total_earnings ?? 0)}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg border bg-surface-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">
                              Total Jobs
                            </div>
                            <div className="mt-1 text-xl font-semibold">
                              {earningsDashboard?.total_jobs ?? '0'}
                            </div>
                          </div>
                        </div>
                        {/* Top-up entry from Earnings section (bug fix: Top-up screen accessible from Earnings) */}
                        <div className="mb-4 flex justify-end">
                          <Button
                            variant="default"
                            onClick={() => setTopUpModalOpen(true)}
                            disabled={!providerId}
                          >
                            Top-up Wallet
                          </Button>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-3">Recent Earnings</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Order</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(earningsDashboard?.earnings || []).length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={4}
                                      className="text-center py-6 text-muted-foreground"
                                    >
                                      No earnings found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  (earningsDashboard?.earnings || []).map((earning: any) => (
                                    <TableRow key={earning.earning_id}>
                                      <TableCell className="font-medium">
                                        {earning.order?.public_id || earning.order_id}
                                      </TableCell>
                                      <TableCell>
                                        {formatAmount(earning.net_amount ?? earning.amount ?? 0)}
                                      </TableCell>
                                      <TableCell>
                                        {getEarningsStatusLabel(
                                          earning.payout_status ?? earning.status
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {earning.earned_at
                                          ? new Date(earning.earned_at).toLocaleString()
                                          : ''}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabPanel>

              {/* Jobs Tab */}
              <TabPanel value="jobs" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Jobs</h3>
                    <p className="text-sm text-muted-foreground">
                      Recent jobs handled by this provider.
                    </p>
                  </div>
                  <div className="card-body p-0">
                    {isLoadingJobs && (
                      <div className="py-6 text-sm text-muted-foreground text-center">
                        Loading jobs...
                      </div>
                    )}
                    {isErrorJobs && !isLoadingJobs && (
                      <div className="py-6 text-sm text-danger text-center">
                        Failed to load jobs.
                      </div>
                    )}
                    {!isLoadingJobs && !isErrorJobs && (
                      <div className="overflow-x-auto">
                        <Table className="min-w-[900px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[30%]">Job</TableHead>
                              <TableHead className="w-[16%]">Status</TableHead>
                              <TableHead className="w-[24%]">Customer</TableHead>
                              <TableHead className="w-[14%] text-right">Amount</TableHead>
                              <TableHead className="w-[16%]">Scheduled At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(jobsData?.jobs || []).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center">
                                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <KeenIcon
                                      icon="calendar-remove"
                                      className="text-2xl text-muted-foreground/70"
                                    />
                                    <p className="text-sm font-medium">No jobs found</p>
                                    <p className="text-xs text-muted-foreground/70">
                                      Jobs assigned to this provider will appear here.
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ) : (
                              (jobsData?.jobs || []).map((job: any) => (
                                <TableRow key={job.assignment_id}>
                                  <TableCell className="font-medium">
                                    {job.service_name || 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    <StatusBadge status={job.status || 'not scheduled'} />
                                  </TableCell>
                                  <TableCell>{job.customer_name || 'N/A'}</TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatAmount(job.final_amount ?? 0)}
                                  </TableCell>
                                  <TableCell>
                                    {job.scheduled_date
                                      ? new Date(job.scheduled_date).toLocaleString()
                                      : 'Not Scheduled'}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              </TabPanel>

              {/* Wallet Tab */}
              <TabPanel value="wallet" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header flex flex-row items-center justify-between">
                    <div>
                      <h3 className="card-title">Wallet</h3>
                      <p className="text-sm text-muted-foreground">Provider wallet balance.</p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setTopUpModalOpen(true)}
                      disabled={!providerId}
                    >
                      Top-up
                    </Button>
                  </div>
                  <div className="card-body">
                    {isLoadingWallet && (
                      <div className="py-6 text-sm text-muted-foreground">Loading wallet...</div>
                    )}
                    {isErrorWallet && !isLoadingWallet && (
                      <div className="py-6 text-sm text-danger">Failed to load wallet data.</div>
                    )}
                    {!isLoadingWallet && !isErrorWallet && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border bg-surface-1">
                          <div className="text-xs font-semibold text-muted-foreground uppercase">
                            Total Balance
                          </div>
                          <div className="mt-1 text-xl font-semibold">
                            {formatAmount(walletData?.total_balance ?? 0)}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-surface-1">
                          <div className="text-xs font-semibold text-muted-foreground uppercase">
                            Earnings Balance
                          </div>
                          <div className="mt-1 text-xl font-semibold">
                            {formatAmount(walletData?.earnings_balance ?? 0)}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-surface-1">
                          <div className="text-xs font-semibold text-muted-foreground uppercase">
                            Commission Balance
                          </div>
                          <div className="mt-1 text-xl font-semibold">
                            {formatAmount(walletData?.commission_balance ?? 0)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabPanel>

              {/* Billing Tab */}
              <TabPanel value="billing" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Billing Model</h3>
                    <p className="text-sm text-muted-foreground">
                      Commission or package model selected for this provider.
                    </p>
                  </div>
                  <div className="card-body">
                    {isLoadingBilling && (
                      <div className="py-6 text-sm text-muted-foreground">
                        Loading billing model...
                      </div>
                    )}
                    {isErrorBilling && !isLoadingBilling && (
                      <div className="py-6 text-sm text-danger">Failed to load billing model.</div>
                    )}
                    {!isLoadingBilling && !isErrorBilling && (
                      <>
                        <div className="mb-4 rounded-md border p-3 bg-surface-1">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Assign plan to provider (commission tier or package public id)
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              className="border rounded px-3 py-2 text-sm w-full"
                              value={billingPlanId}
                              onChange={(e) => setBillingPlanId(e.target.value)}
                            >
                              <option value="">Select billing model</option>
                              {billingPlanOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="default"
                              disabled={
                                !providerId ||
                                !billingPlanId ||
                                updateProviderBillingMutation.isLoading
                              }
                              onClick={() => {
                                if (!providerId || !billingPlanId) return;
                                updateProviderBillingMutation.mutate({
                                  providerId,
                                  data: { plan_id: billingPlanId } as any
                                });
                              }}
                            >
                              Assign Plan
                            </Button>
                          </div>
                        </div>
                        {!billingData?.selected_model ? (
                          <div className="py-6 text-sm text-muted-foreground">
                            No billing model selected for this provider.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-semibold">Type:</span>{' '}
                              {billingData.selected_model.type}
                            </div>
                            <div className="text-sm">
                              <span className="font-semibold">Name:</span>{' '}
                              {billingData.selected_model.name}
                            </div>
                            {billingData.selected_model.description && (
                              <div className="text-sm">
                                <span className="font-semibold">Description:</span>{' '}
                                {billingData.selected_model.description}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </TabPanel>

              {/* Service Zones Tab */}
              <TabPanel value="zones" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Service Zones</h3>
                    <p className="text-sm text-muted-foreground">
                      Areas where provider offers services
                    </p>
                  </div>
                  <div className="card-body p-0">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[720px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Zone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Jobs Completed</TableHead>
                            {/* <TableHead>Actions</TableHead> */}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceZones.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No service zones found
                              </TableCell>
                            </TableRow>
                          ) : (
                            serviceZones.map((zone: any, index: number) => (
                              <TableRow key={zone.zone_id || index}>
                                <TableCell className="font-medium">{zone.zone}</TableCell>
                                <TableCell>
                                  <StatusBadge status={zone.status} />
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {zone.jobsCompleted || 0}
                                </TableCell>
                                {/* <TableCell>
                          <div className="flex gap-2">
                            {zone.status === 'active' ? (
                              <Button variant="outline" className="border-warning text-warning hover:bg-warning hover:text-white" size="sm">
                                <KeenIcon icon="cross-square" className="me-1" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button variant="default" className="bg-success text-white hover:bg-success/90" size="sm">
                                <KeenIcon icon="to-right" className="me-1" />
                                Activate
                              </Button>
                            )}
                          </div>
                        </TableCell> */}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Availability Schedule Tab */}
              <TabPanel value="schedule" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Availability Schedule</h3>
                    <p className="text-sm text-muted-foreground">Weekly working hours</p>
                  </div>
                  <div className="card-body">
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                      <KeenIcon icon="calendar-remove" className="text-4xl" />
                      <p className="text-sm">Availability schedule feature coming soon</p>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* Reviews & Ratings Tab */}
              <TabPanel value="reviews" className="space-y-6 pt-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Reviews & Ratings</h3>
                    <p className="text-sm text-muted-foreground">Customer feedback and ratings</p>
                  </div>
                  <div className="card-body p-0">
                    <div className="overflow-x-auto">
                      <Table className="min-w-[900px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reviews.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No reviews found
                              </TableCell>
                            </TableRow>
                          ) : (
                            reviews.map((review: any) => (
                              <TableRow key={review.id || review.review_id}>
                                <TableCell className="font-medium">{review.customerName}</TableCell>
                                <TableCell>{review.service || 'N/A'}</TableCell>
                                <TableCell>{renderStars(review.rating)}</TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="truncate" title={review.comment}>
                                    {review.comment}
                                  </div>
                                </TableCell>
                                <TableCell>{review.date}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </Tabs>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="flex justify-end gap-3 border-t bg-surface-1 px-6 py-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {displayProvider?.status === 'ACTIVE' && (
              <Button
                variant="destructive"
                onClick={handleBlockProvider}
                disabled={updateStatusMutation.isLoading}
              >
                <KeenIcon icon="cross-circle" className="me-2" />
                {updateStatusMutation.isLoading ? 'Blocking...' : 'Block Provider'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>

      {/* Reject Document Dialog */}
      <Dialog open={rejectDocumentDialogOpen} onOpenChange={setRejectDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Document</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectDocumentReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectDocumentReason"
                  value={rejectDocumentReason}
                  onChange={(e) => setRejectDocumentReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this document..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDocumentDialogOpen(false);
                setRejectDocumentReason('');
                setSelectedDocumentId(null);
              }}
              disabled={verifyKycMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejectDocument}
              disabled={!rejectDocumentReason.trim() || verifyKycMutation.isLoading}
            >
              {verifyKycMutation.isLoading ? 'Rejecting...' : 'Reject Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top-up Wallet Dialog — accessible from Earnings section (bug fix: Top-up screen) */}
      <Dialog open={topUpModalOpen} onOpenChange={setTopUpModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top-up Wallet</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topup-amount">Amount (₹) *</Label>
                <Input
                  id="topup-amount"
                  type="number"
                  min={1}
                  step={0.01}
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="topup-desc">Description (optional)</Label>
                <Input
                  id="topup-desc"
                  value={topUpDescription}
                  onChange={(e) => setTopUpDescription(e.target.value)}
                  placeholder="e.g. Admin top-up"
                  className="mt-1"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTopUpModalOpen(false);
                setTopUpAmount('');
                setTopUpDescription('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !topUpAmount || parseFloat(topUpAmount) <= 0 || adjustWalletMutation.isLoading
              }
              onClick={() => {
                if (!providerId) return;
                const amt = parseFloat(topUpAmount);
                if (isNaN(amt) || amt <= 0) return;
                adjustWalletMutation.mutate({
                  providerId,
                  data: {
                    amount: amt,
                    type: 'ADD',
                    description: topUpDescription.trim() || undefined
                  }
                });
              }}
            >
              {adjustWalletMutation.isLoading ? 'Processing...' : 'Confirm Top-up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDocumentOpen} onOpenChange={setViewDocumentOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="document" className="text-primary" />
              {selectedDocument?.type || 'Document'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {selectedDocument?.file_url ? (
              <div className="mt-4">
                {isImageFile(selectedDocument.file_url) ? (
                  <div className="w-full flex justify-center">
                    <img
                      src={selectedDocument.file_url}
                      alt={selectedDocument.type || 'Document'}
                      className="max-w-full max-h-[70vh] w-auto h-auto rounded-lg border border-gray-200 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect fill="%23ddd" width="800" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="24"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ) : isPdfFile(selectedDocument.file_url) ? (
                  <div className="w-full">
                    <iframe
                      src={selectedDocument.file_url}
                      className="w-full h-[600px] rounded-lg border border-gray-200"
                      title={selectedDocument.type || 'Document'}
                    />
                    <div className="mt-4 text-center">
                      <a
                        href={selectedDocument.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <KeenIcon icon="arrow-top-right" className="text-sm" />
                        Open in new tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-4">
                      <KeenIcon icon="document" className="text-gray-400 text-5xl" />
                      <p className="text-gray-600">Document preview not available</p>
                      <a
                        href={selectedDocument.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <KeenIcon icon="arrow-top-right" className="text-sm" />
                        Open document
                      </a>
                    </div>
                  </div>
                )}
                {selectedDocument.documentNumber && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* <div className="text-sm text-gray-600">
                      <span className="font-medium">Document ID:</span> {selectedDocument.documentNumber}
                    </div> */}
                    {selectedDocument.uploadDate && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Upload Date:</span>{' '}
                        {selectedDocument.uploadDate}
                      </div>
                    )}
                    {selectedDocument.verifiedDate && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Verified Date:</span>{' '}
                        {selectedDocument.verifiedDate}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <KeenIcon icon="document" className="text-gray-400 text-5xl mx-auto mb-4" />
                  <p className="text-gray-600">Document file not available</p>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewDocumentOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export { ProviderProfileModal };
