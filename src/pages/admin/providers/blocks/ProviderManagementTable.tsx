import { useState } from 'react';
import { toast } from 'sonner';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IProvider, IPaginationMeta } from '@/services/provider.types';
import { ContentLoader } from '@/components/loaders';
import {
  useUpdateProviderStatus
} from '@/services';
import { toAbsoluteUrl } from '@/utils';

interface IProviderManagementTableProps {
  providers: IProvider[];
  pagination: IPaginationMeta | null;
  isLoading?: boolean;
  onProviderSelect: (provider: IProvider) => void;
  onEditProvider?: (provider: IProvider) => void;
  onPageChange?: (page: number) => void;
}

const ProviderManagementTable = ({
  providers,
  pagination,
  isLoading = false,
  onProviderSelect,
  onEditProvider,
  onPageChange
}: IProviderManagementTableProps) => {

  // Generic confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'default' | 'destructive' | 'success';
    illustration: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'default',
    illustration: '23',
    onConfirm: () => { },
  });



  const updateStatusMutation = useUpdateProviderStatus({
    onSuccess: (data) => {
      toast.success('Provider status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update provider status');
    },
  });

  const handleViewProfile = (provider: IProvider) => {
    onProviderSelect(provider);
  };



  const handleBlockProvider = (providerId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Block Provider',
      description: 'Are you sure you want to block this provider? They will not be able to log in or access their account.',
      confirmText: 'Block Provider',
      variant: 'destructive',
      illustration: '23', // Warning illustration
      onConfirm: () => updateStatusMutation.mutate({ providerId, status: 'SUSPENDED' }), // API uses SUSPENDED for block in this context
    });
  };

  const handleSuspendProvider = (providerId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Suspend Provider',
      description: 'Are you sure you want to suspend this provider? This is a temporary action.',
      confirmText: 'Suspend Provider',
      variant: 'destructive',
      illustration: '23',
      onConfirm: () => updateStatusMutation.mutate({ providerId, status: 'SUSPENDED' }),
    });
  };

  const handleActivateProvider = (providerId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Activate Provider',
      description: 'Are you sure you want to activate this provider? This will restore their access to the platform.',
      confirmText: 'Activate Provider',
      variant: 'success',
      illustration: '1', // Person with laptop illustration from ref
      onConfirm: () => updateStatusMutation.mutate({ providerId, status: 'ACTIVE' }),
    });
  };

  const getKYCStatusBadge = (status: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = (status || '').toLowerCase();
    const statusConfig: { [key: string]: { variant: string; className: string; text: string } } = {
      approved: { variant: 'default', className: 'bg-success text-white', text: 'Approved' },
      pending: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      rejected: { variant: 'destructive', className: '', text: 'Rejected' },
      'under-review': { variant: 'secondary', className: '', text: 'Under Review' },
      'under_review': { variant: 'secondary', className: '', text: 'Under Review' }
    };

    const config = statusConfig[normalizedStatus] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = (status || '').toLowerCase();
    const statusConfig: { [key: string]: { variant: string; className: string; text: string } } = {
      active: { variant: 'default', className: 'bg-success text-white', text: 'Active' },
      inactive: { variant: 'secondary', className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-medium', text: 'Inactive' },
      blocked: { variant: 'destructive', className: '', text: 'Blocked' },
      blacklisted: { variant: 'destructive', className: '', text: 'Blocked' },
      suspended: { variant: 'default', className: 'bg-warning text-white', text: 'Suspended' }
    };

    const config = statusConfig[normalizedStatus] || { variant: 'outline', className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-medium', text: status || 'Inactive' };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<KeenIcon key={i} icon="star" className="text-warning text-sm" />);
    }

    if (hasHalfStar) {
      stars.push(<KeenIcon key="half" icon="star-half" className="text-warning text-sm" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<KeenIcon key={`empty-${i}`} icon="star" className="text-gray-300 text-sm" />);
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          Service Providers {pagination ? `(${pagination.total})` : `(${providers.length})`}
        </h3>
      </div>

      <div className="card-body p-0">
        {isLoading ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : providers.length === 0 ? (
          <div className="p-8 text-center">
            <KeenIcon icon="shop" className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No providers found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Provider ID</TableHead>
                    <TableHead className="max-w-[200px]">Name</TableHead>
                    <TableHead className="hidden md:table-cell">Service Category</TableHead>
                    <TableHead className="hidden lg:table-cell">KYC Status</TableHead>
                    <TableHead className="hidden md:table-cell">Rating</TableHead>
                    <TableHead className="hidden sm:table-cell">Jobs</TableHead>
                    <TableHead className="hidden lg:table-cell">Earnings</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="hidden sm:table-cell font-medium">{provider.id}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-center gap-3">
                          {provider.avatar ? (
                            <img
                              src={provider.avatar}
                              alt={provider.name || 'Provider'}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                // Hide image and show fallback
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0 ${provider.avatar ? 'hidden' : ''}`}
                          >
                            {provider.name ? (
                              <span className="text-primary text-xs font-semibold">
                                {provider.name.charAt(0).toUpperCase()}
                              </span>
                            ) : (
                              <KeenIcon icon="shop" className="text-primary text-sm" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{provider.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500 hidden sm:block">
                              Joined {formatDate(provider.joinDate)}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">{provider.id || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="badge-outline">
                          {provider.serviceCategory || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {getKYCStatusBadge(provider.kycStatus)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {renderStars(provider.rating || 0)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-center">
                          <div className="font-semibold">{provider.jobsCompleted || 0}</div>
                          <div className="text-sm text-gray-500">jobs</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-center">
                          <div className="font-semibold">
                            {formatCurrency(typeof provider.earnings === 'number' ? provider.earnings : provider.earnings?.total_net || 0)}
                          </div>
                          <div className="text-sm text-gray-500">total</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{getStatusBadge(provider.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <div className="flex flex-col gap-1 sm:hidden mr-2">
                            <div className="md:hidden">
                              {getKYCStatusBadge(provider.kycStatus)}
                            </div>
                            <div className="lg:hidden">
                              {getStatusBadge(provider.status)}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex-shrink-0">
                                <KeenIcon icon="dots-vertical" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProfile(provider)}>
                                <KeenIcon icon="eye" className="me-2" />
                                View Profile
                              </DropdownMenuItem>
                              {onEditProvider && (
                                <DropdownMenuItem onClick={() => onEditProvider(provider)}>
                                  <KeenIcon icon="notepad-edit" className="me-2" />
                                  Edit Provider
                                </DropdownMenuItem>
                              )}
                              {((provider.status || '').toLowerCase() === 'active') && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleBlockProvider(provider.id)}
                                    className="text-danger"
                                    disabled={updateStatusMutation.isLoading}
                                  >
                                    <KeenIcon icon="cross-circle" className="me-2" />
                                    Block Provider
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleSuspendProvider(provider.id)}
                                    className="text-warning"
                                    disabled={updateStatusMutation.isLoading}
                                  >
                                    <KeenIcon icon="minus-circle" className="me-2" />
                                    Suspend Provider
                                  </DropdownMenuItem>
                                </>
                              )}
                              {((provider.status || '').toLowerCase() === 'suspended' || (provider.status || '').toLowerCase() === 'blocked') && (
                                <DropdownMenuItem
                                  onClick={() => handleActivateProvider(provider.id)}
                                  className="text-success"
                                  disabled={updateStatusMutation.isLoading}
                                >
                                  <KeenIcon icon="check-circle" className="me-2" />
                                  Activate Provider
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && onPageChange && (
              <div className="card-footer">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} providers
                  </div>
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pagination.page > 1 && !isLoading) {
                            onPageChange(pagination.page - 1);
                          }
                        }}
                        disabled={pagination.page <= 1 || isLoading}
                      >
                        <KeenIcon icon="arrow-left" className="me-1" />
                        Previous
                      </Button>
                      <div className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pagination.page < pagination.totalPages && !isLoading) {
                            onPageChange(pagination.page + 1);
                          }
                        }}
                        disabled={pagination.page >= pagination.totalPages || isLoading}
                      >
                        Next
                        <KeenIcon icon="arrow-right" className="ms-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Generic Confirmation Dialog */}
      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-[500px]">
          <DialogHeader className="border-0 pt-5 justify-center">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col items-center pt-0 pb-10">
            <div className="mb-6">
              <img
                src={toAbsoluteUrl(`/media/illustrations/${confirmModal.illustration}.svg`)}
                className="dark:hidden max-h-[160px]"
                alt="Confirmation Illustration"
              />
              <img
                src={toAbsoluteUrl(`/media/illustrations/${confirmModal.illustration}-dark.svg`)}
                className="light:hidden max-h-[160px]"
                alt="Confirmation Illustration"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
              {confirmModal.title}
            </h3>

            <div className="text-center mb-8 px-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                {confirmModal.description}
              </p>
            </div>

            <div className="flex justify-center gap-3 w-full px-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={updateStatusMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                variant={confirmModal.variant === 'success' ? 'default' : confirmModal.variant}
                className={`flex-1 ${confirmModal.variant === 'success' ? 'bg-[#15D053] hover:bg-[#12b84a] text-white border-0 font-semibold' : ''}`}
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                disabled={updateStatusMutation.isLoading}
              >
                {confirmModal.confirmText}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ProviderManagementTable };
