import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabPanel,
  TabsList,
  Tab,
} from '@/components/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProvider, useUpdateProviderStatus, useVerifyKycDocument } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { toast } from 'sonner';

interface IProviderProfileModalProps {
  provider: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProviderProfileModal = ({ provider, isOpen, onClose }: IProviderProfileModalProps) => {
  const providerId = provider?.id || provider?.provider_id || null;
  const { provider: providerDetail, isLoading, isError, error, refetch } = useProvider(providerId, {
    enabled: isOpen && !!providerId,
  });

  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [rejectDocumentDialogOpen, setRejectDocumentDialogOpen] = useState(false);
  const [rejectDocumentReason, setRejectDocumentReason] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(null);

  const verifyKycMutation = useVerifyKycDocument({
    onSuccess: (data) => {
      toast.success((data as any).message || 'KYC document updated successfully');
      setLoadingDocumentId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update KYC document');
      setLoadingDocumentId(null);
    },
  });


  const updateStatusMutation = useUpdateProviderStatus({
    onSuccess: (data) => {
      toast.success((data as any).message || 'Provider status updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update provider status');
    },
  });

  // Use detailed provider data if available, otherwise fall back to basic provider data
  const displayProvider = providerDetail || provider;

  if (!provider && !providerDetail) return null;

  // Extract data from API response - preserve full document data including file_url
  // Map verification_status: PENDING -> pending, VERIFIED -> verified, REJECTED -> rejected
  const kycDocuments = (displayProvider?.kyc?.documents || []).map((doc: any) => {
    const verificationStatus = doc.verification_status || doc.status || 'PENDING';
    const statusMap: { [key: string]: string } = {
      'PENDING': 'pending',
      'VERIFIED': 'verified',
      'REJECTED': 'rejected',
      'pending': 'pending',
      'verified': 'verified',
      'rejected': 'rejected'
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
      originalDoc: doc, // Preserve full original document data
    };
  });

  const serviceZones = (displayProvider?.zones || []).map((zone: any) => ({
    zone: zone.name || 'Unknown Zone',
    status: 'active', // Zones from API are already filtered to active
    jobsCompleted: 0, // This would need to be calculated from job assignments
    zone_id: zone.zone_id || zone.public_id,
  }));

  const reviews = (displayProvider?.recent_reviews || []).map((review: any) => ({
    id: review.review_id || 'N/A',
    customerName: review.user_name || 'Anonymous',
    rating: review.rating || 0,
    comment: review.comment || 'No comment',
    date: review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A',
    service: 'Service', // This would need to come from the order/service data
    order_id: review.order_id,
  }));

  const recentJobs = displayProvider?.recent_jobs || [];
  const stats = displayProvider?.stats || {};
  const earnings = displayProvider?.earnings || {};

  // Generate availability schedule from provider data
  const availabilitySchedule = (() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const isAvailable = displayProvider?.is_available ?? false;
    const startTime = displayProvider?.availability_start || displayProvider?.availabilityStart || '09:00';
    const endTime = displayProvider?.availability_end || displayProvider?.availabilityEnd || '18:00';
    
    return days.map(day => ({
      day,
      time: isAvailable ? `${startTime} - ${endTime}` : 'Not Available',
      status: isAvailable ? 'available' : 'unavailable'
    }));
  })();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { variant: 'success', text: 'Verified', className: '' },
      pending: { variant: 'warning', text: 'Pending', className: '' },
      rejected: { variant: 'destructive', text: 'Rejected', className: '' },
      active: { variant: 'success', text: 'Active', className: '' },
      inactive: { variant: 'secondary', text: 'Inactive', className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-medium' },
      available: { variant: 'success', text: 'Available', className: '' },
      unavailable: { variant: 'destructive', text: 'Unavailable', className: '' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline', text: status || 'Inactive', className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-medium' };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <KeenIcon 
          key={i} 
          icon={i < rating ? "star" : "star"} 
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
          action: 'approve',
        },
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
          rejection_reason: rejectDocumentReason.trim(),
        },
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
      status: 'SUSPENDED',
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
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

  const isPdfFile = (url: string | null) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  const providerName = displayProvider?.name || displayProvider?.business_name || displayProvider?.user?.name || 'Unknown Provider';
  const providerEmail = displayProvider?.email || displayProvider?.user?.email || 'N/A';
  const providerPhone = displayProvider?.phone || displayProvider?.user?.phone || 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="shop" className="text-primary" />
            Provider Profile - {providerName}
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

        <div className="px-6 pb-6">
          <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <Tab value="personal">Personal Details</Tab>
            <Tab value="kyc">KYC Documents</Tab>
            <Tab value="zones">Service Zones</Tab>
            <Tab value="schedule">Availability</Tab>
            <Tab value="reviews">Reviews & Ratings</Tab>
          </TabsList>

          {/* Personal Details Tab */}
          <TabPanel value="personal" className="space-y-6 pt-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Personal Details</h3>
                <p className="text-sm text-gray-600">Provider personal information</p>
              </div>
              <div className="card-body">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Provider Image Section */}
                  <div className="flex-shrink-0 flex items-center justify-center md:items-start">
                    <div className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                      {displayProvider?.profile_picture_url || displayProvider?.user?.profile_picture_url || displayProvider?.avatar ? (
                        <img
                          src={displayProvider?.profile_picture_url || displayProvider?.user?.profile_picture_url || displayProvider?.avatar}
                          alt={displayProvider?.user?.name || displayProvider?.name || 'Provider'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {(!displayProvider?.profile_picture_url && !displayProvider?.user?.profile_picture_url && !displayProvider?.avatar) && (
                        <KeenIcon icon="user" className="text-gray-400 text-5xl" />
                      )}
                    </div>
                  </div>

                  {/* Personal Details Table */}
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Provider ID</div>
                        <div className="text-sm font-medium">{displayProvider?.provider_id || displayProvider?.id || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</div>
                        <div className="text-sm font-medium">{displayProvider?.user?.name || displayProvider?.name || displayProvider?.business_name || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business Name</div>
                        <div className="text-sm">{displayProvider?.business_name || displayProvider?.name || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</div>
                        <div className="text-sm">{displayProvider?.user?.email || displayProvider?.email || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</div>
                        <div className="text-sm">{displayProvider?.user?.phone || displayProvider?.phone || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                        <div>{getStatusBadge((displayProvider?.status || 'inactive').toLowerCase())}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">KYC Status</div>
                        <div>{getStatusBadge((displayProvider?.kyc_status || displayProvider?.kycStatus || 'pending').toLowerCase())}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Joined Date</div>
                        <div className="text-sm">{displayProvider?.joined_at || displayProvider?.joinDate || displayProvider?.createdAt ? new Date(displayProvider?.joined_at || displayProvider?.joinDate || displayProvider?.createdAt).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>

                    {/* Address Section */}
                    {(displayProvider?.address || displayProvider?.city || displayProvider?.state || displayProvider?.pincode || displayProvider?.country || (displayProvider?.zones && displayProvider.zones.length > 0)) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-4">Address Information</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(displayProvider?.address || (displayProvider?.zones && displayProvider.zones.length > 0)) && (
                            <div className="space-y-1 md:col-span-2">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</div>
                              <div className="text-sm">
                                {displayProvider?.address || (displayProvider?.zones && displayProvider.zones.length > 0 ? displayProvider.zones.map((zone: any) => zone.name).join(', ') : 'N/A')}
                              </div>
                            </div>
                          )}
                          {displayProvider?.city && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</div>
                              <div className="text-sm">{displayProvider.city}</div>
                            </div>
                          )}
                          {displayProvider?.state && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">State</div>
                              <div className="text-sm">{displayProvider.state}</div>
                            </div>
                          )}
                          {displayProvider?.pincode && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pincode</div>
                              <div className="text-sm">{displayProvider.pincode || displayProvider.zipCode || 'N/A'}</div>
                            </div>
                          )}
                          {displayProvider?.country && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Country</div>
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
                                    {loadingDocumentId === doc.document_id ? 'Approving...' : 'Approve'}
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleRejectKYCDocument(doc.document_id)}
                                    disabled={loadingDocumentId !== null}
                                  >
                                    <KeenIcon icon="cross" className="me-1" />
                                    {loadingDocumentId === doc.document_id ? 'Rejecting...' : 'Reject'}
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

          {/* Service Zones Tab */}
          <TabPanel value="zones" className="space-y-6 pt-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Service Zones</h3>
                <p className="text-sm text-gray-600">Areas where provider offers services</p>
              </div>
              <div className="card-body p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Jobs Completed</TableHead>
                      {/* <TableHead>Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceZones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No service zones found
                        </TableCell>
                      </TableRow>
                    ) : (
                      serviceZones.map((zone: any, index: number) => (
                        <TableRow key={zone.zone_id || index}>
                          <TableCell className="font-medium">{zone.zone}</TableCell>
                          <TableCell>{getStatusBadge(zone.status)}</TableCell>
                          <TableCell>{zone.jobsCompleted || 0}</TableCell>
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
          </TabPanel>

          {/* Availability Schedule Tab */}
          <TabPanel value="schedule" className="space-y-6 pt-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Availability Schedule</h3>
                <p className="text-sm text-gray-600">Weekly working hours</p>
              </div>
              <div className="card-body">
                <p className="text-gray-500 text-center py-8">
                  Availability schedule feature coming soon
                </p>
              </div>
            </div>
          </TabPanel>

          {/* Reviews & Ratings Tab */}
          <TabPanel value="reviews" className="space-y-6 pt-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Availability Schedule</h3>
                <p className="text-sm text-gray-600">Weekly working hours</p>
              </div>
              <div className="card-body p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availabilitySchedule.map((schedule, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{schedule.day}</TableCell>
                        <TableCell>{schedule.time}</TableCell>
                        <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabPanel>

          {/* Reviews & Ratings Tab */}
          <TabPanel value="reviews" className="space-y-6 pt-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Reviews & Ratings</h3>
                <p className="text-sm text-gray-600">Customer feedback and ratings</p>
              </div>
              <div className="card-body p-0">
                <Table>
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
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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
          </TabPanel>
          </Tabs>
        </div>
        )}

        {!isLoading && !isError && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
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
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect fill="%23ddd" width="800" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="24"%3EImage Not Available%3C/text%3E%3C/svg%3E';
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
                        <span className="font-medium">Upload Date:</span> {selectedDocument.uploadDate}
                      </div>
                    )}
                    {selectedDocument.verifiedDate && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Verified Date:</span> {selectedDocument.verifiedDate}
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
