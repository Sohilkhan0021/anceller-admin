import { useState } from 'react';
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

interface IProviderProfileModalProps {
  provider: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProviderProfileModal = ({ provider, isOpen, onClose }: IProviderProfileModalProps) => {
  if (!provider) return null;

  // Mock data for provider details
  const kycDocuments = [
    {
      type: 'Aadhaar Card',
      status: 'verified',
      uploadDate: '2024-01-10',
      documentNumber: '****1234'
    },
    {
      type: 'PAN Card',
      status: 'verified',
      uploadDate: '2024-01-10',
      documentNumber: 'ABCDE1234F'
    },
    {
      type: 'Bank Statement',
      status: 'pending',
      uploadDate: '2024-01-15',
      documentNumber: '****5678'
    }
  ];

  const serviceZones = [
    { zone: 'South Delhi', status: 'active', jobsCompleted: 15 },
    { zone: 'Central Delhi', status: 'active', jobsCompleted: 8 },
    { zone: 'East Delhi', status: 'inactive', jobsCompleted: 3 }
  ];

  const availabilitySchedule = [
    { day: 'Monday', time: '9:00 AM - 6:00 PM', status: 'available' },
    { day: 'Tuesday', time: '9:00 AM - 6:00 PM', status: 'available' },
    { day: 'Wednesday', time: '10:00 AM - 4:00 PM', status: 'available' },
    { day: 'Thursday', time: '9:00 AM - 6:00 PM', status: 'available' },
    { day: 'Friday', time: '9:00 AM - 6:00 PM', status: 'available' },
    { day: 'Saturday', time: '10:00 AM - 2:00 PM', status: 'available' },
    { day: 'Sunday', time: 'Not Available', status: 'unavailable' }
  ];

  const reviews = [
    {
      id: 'REV001',
      customerName: 'John Doe',
      rating: 5,
      comment: 'Excellent work! Very professional and punctual.',
      date: '2024-01-18',
      service: 'Electrical Repair'
    },
    {
      id: 'REV002',
      customerName: 'Jane Smith',
      rating: 4,
      comment: 'Good service, completed on time.',
      date: '2024-01-15',
      service: 'Wiring Installation'
    },
    {
      id: 'REV003',
      customerName: 'Mike Johnson',
      rating: 5,
      comment: 'Outstanding quality of work. Highly recommended!',
      date: '2024-01-12',
      service: 'Switch Board Repair'
    }
  ];

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="shop" className="text-primary" />
            Provider Profile - {provider.name}
          </DialogTitle>
        </DialogHeader>

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
                    {kycDocuments.map((doc, index) => (
                      <TableRow key={index}>
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
                    ))}
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
                    {serviceZones.map((zone, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{zone.zone}</TableCell>
                        <TableCell>{getStatusBadge(zone.status)}</TableCell>
                        <TableCell>{zone.jobsCompleted}</TableCell>
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
                    ))}
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
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.customerName}</TableCell>
                        <TableCell>{review.service}</TableCell>
                        <TableCell>{renderStars(review.rating)}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={review.comment}>
                            {review.comment}
                          </div>
                        </TableCell>
                        <TableCell>{review.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabPanel>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default" className="bg-success text-white hover:bg-success/90">
            <KeenIcon icon="check-circle" className="me-2" />
            Approve KYC
          </Button>
          <Button variant="destructive">
            <KeenIcon icon="cross-circle" className="me-2" />
            Block Provider
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ProviderProfileModal };
