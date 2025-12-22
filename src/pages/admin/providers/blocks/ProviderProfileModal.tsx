import { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useProvider } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';

interface IProviderProfileModalProps {
  provider: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProviderProfileModal = ({ provider, isOpen, onClose }: IProviderProfileModalProps) => {
  const providerId = provider?.id || provider?.provider_id || null;
  const { provider: providerDetail, isLoading, isError, error } = useProvider(providerId, {
    enabled: isOpen && !!providerId,
  });

  // Use detailed provider data if available, otherwise fall back to basic provider data
  const displayProvider = providerDetail || provider;

  if (!provider && !providerDetail) return null;

  // Extract data from API response
  const kycDocuments = (displayProvider?.kyc?.documents || []).map((doc: any) => ({
    type: doc.document_type || 'Unknown',
    status: (doc.status || 'pending').toLowerCase(),
    uploadDate: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A',
    documentNumber: doc.public_id || 'N/A',
    document_id: doc.document_id || doc.public_id,
  }));

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
      verified: { variant: 'success', text: 'Verified' },
      pending: { variant: 'warning', text: 'Pending' },
      rejected: { variant: 'destructive', text: 'Rejected' },
      active: { variant: 'success', text: 'Active' },
      inactive: { variant: 'secondary', text: 'Inactive' },
      available: { variant: 'success', text: 'Available' },
      unavailable: { variant: 'destructive', text: 'Unavailable' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant as any}>{config.text}</Badge>;
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
          <Tabs defaultValue="kyc" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <Tab value="kyc">KYC Documents</Tab>
            <Tab value="zones">Service Zones</Tab>
            <Tab value="schedule">Availability</Tab>
            <Tab value="reviews">Reviews & Ratings</Tab>
          </TabsList>

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
                      <TableHead>Document Number</TableHead>
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
                          <TableCell>{doc.documentNumber}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <KeenIcon icon="eye" className="me-1" />
                                View
                              </Button>
                              {doc.status === 'pending' && (
                                <>
                                  <Button variant="default" className="bg-success text-white hover:bg-success/90" size="sm">
                                    <KeenIcon icon="check" className="me-1" />
                                    Approve
                                  </Button>
                                  <Button variant="destructive" size="sm">
                                    <KeenIcon icon="cross" className="me-1" />
                                    Reject
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
                      <TableHead>Actions</TableHead>
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
                        <TableCell>
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
                        </TableCell>
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
            {displayProvider?.kyc_status === 'PENDING' && (
              <>
                <Button variant="default" className="bg-success text-white hover:bg-success/90">
                  <KeenIcon icon="check-circle" className="me-2" />
                  Approve KYC
                </Button>
                <Button variant="destructive">
                  <KeenIcon icon="cross-circle" className="me-2" />
                  Reject KYC
                </Button>
              </>
            )}
            {displayProvider?.status === 'ACTIVE' && (
              <Button variant="destructive">
                <KeenIcon icon="cross-circle" className="me-2" />
                Block Provider
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { ProviderProfileModal };
