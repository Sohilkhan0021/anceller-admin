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
  useApproveProvider, 
  useRejectProvider, 
  useUpdateProviderStatus 
} from '@/services';

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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const approveMutation = useApproveProvider({
    onSuccess: (data) => {
      toast.success('Provider approved successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve provider');
    },
  });

  const rejectMutation = useRejectProvider({
    onSuccess: (data) => {
      toast.success('Provider rejected successfully');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedProviderId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject provider');
    },
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

  const handleApproveKYC = (providerId: string) => {
    if (window.confirm('Are you sure you want to approve this provider?')) {
      approveMutation.mutate(providerId);
    }
  };

  const handleRejectKYC = (providerId: string) => {
    setSelectedProviderId(providerId);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedProviderId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    rejectMutation.mutate({
      providerId: selectedProviderId,
      reason: rejectReason.trim(),
    });
  };

  const handleBlockProvider = (providerId: string) => {
    if (window.confirm('Are you sure you want to block this provider?')) {
      updateStatusMutation.mutate({
        providerId,
        status: 'SUSPENDED',
      });
    }
  };

  const handleSuspendProvider = (providerId: string) => {
    if (window.confirm('Are you sure you want to suspend this provider?')) {
      updateStatusMutation.mutate({
        providerId,
        status: 'SUSPENDED',
      });
    }
  };

  const handleActivateProvider = (providerId: string) => {
    if (window.confirm('Are you sure you want to activate this provider?')) {
      updateStatusMutation.mutate({
        providerId,
        status: 'ACTIVE',
      });
    }
  };

  const getKYCStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { variant: 'default', className: 'bg-success text-white', text: 'Approved' },
      pending: { variant: 'default', className: 'bg-warning text-white', text: 'Pending' },
      rejected: { variant: 'destructive', className: '', text: 'Rejected' },
      'under-review': { variant: 'secondary', className: '', text: 'Under Review' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default', className: 'bg-success text-white', text: 'Active' },
      blocked: { variant: 'destructive', className: '', text: 'Blocked' },
      suspended: { variant: 'default', className: 'bg-warning text-white', text: 'Suspended' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline', className: '', text: status };
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
                          {provider.kycStatus === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleApproveKYC(provider.id)}
                                className="text-success"
                                disabled={approveMutation.isLoading}
                              >
                                <KeenIcon icon="check-circle" className="me-2" />
                                Approve KYC
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRejectKYC(provider.id)}
                                className="text-danger"
                                disabled={rejectMutation.isLoading}
                              >
                                <KeenIcon icon="cross-circle" className="me-2" />
                                Reject KYC
                              </DropdownMenuItem>
                            </>
                          )}
                          {provider.status === 'active' && (
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
                          {(provider.status === 'suspended' || provider.status === 'blocked') && (
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
            {pagination && pagination.totalPages > 1 && onPageChange && (
              <div className="card-footer">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} providers
                  </div>
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
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Provider Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Provider KYC</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this provider's KYC..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectDialogOpen(false);
                    setRejectReason('');
                    setSelectedProviderId(null);
                  }}
                  disabled={rejectMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmReject}
                  disabled={!rejectReason.trim() || rejectMutation.isLoading}
                >
                  {rejectMutation.isLoading ? 'Rejecting...' : 'Reject Provider'}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ProviderManagementTable };
