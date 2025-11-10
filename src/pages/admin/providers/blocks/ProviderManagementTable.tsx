import { useState } from 'react';
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

interface IProvider {
  id: string;
  name: string;
  serviceCategory: string;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'under-review';
  rating: number;
  jobsCompleted: number;
  earnings: number;
  status: 'active' | 'blocked' | 'suspended';
  joinDate: string;
  lastActive: string;
}

interface IProviderManagementTableProps {
  onProviderSelect: (provider: IProvider) => void;
  onEditProvider?: (provider: IProvider) => void;
}

const ProviderManagementTable = ({ onProviderSelect, onEditProvider }: IProviderManagementTableProps) => {
  // Mock data - in real app, this would come from API
  const providers: IProvider[] = [
    {
      id: 'PRV001',
      name: 'Rajesh Kumar',
      serviceCategory: 'Electrical',
      kycStatus: 'approved',
      rating: 4.8,
      jobsCompleted: 45,
      earnings: 12500,
      status: 'active',
      joinDate: '2024-01-10',
      lastActive: '2024-01-20'
    },
    {
      id: 'PRV002',
      name: 'Priya Sharma',
      serviceCategory: 'AC',
      kycStatus: 'pending',
      rating: 4.5,
      jobsCompleted: 23,
      earnings: 8500,
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-01-19'
    },
    {
      id: 'PRV003',
      name: 'Amit Singh',
      serviceCategory: 'Plumbing',
      kycStatus: 'approved',
      rating: 4.9,
      jobsCompleted: 67,
      earnings: 18900,
      status: 'active',
      joinDate: '2024-01-05',
      lastActive: '2024-01-20'
    },
    {
      id: 'PRV004',
      name: 'Sunita Patel',
      serviceCategory: 'Cleaning',
      kycStatus: 'under-review',
      rating: 4.2,
      jobsCompleted: 12,
      earnings: 3200,
      status: 'active',
      joinDate: '2024-01-18',
      lastActive: '2024-01-19'
    },
    {
      id: 'PRV005',
      name: 'Vikram Gupta',
      serviceCategory: 'Carpentry',
      kycStatus: 'rejected',
      rating: 3.8,
      jobsCompleted: 8,
      earnings: 2400,
      status: 'blocked',
      joinDate: '2024-01-12',
      lastActive: '2024-01-15'
    }
  ];

  const handleViewProfile = (provider: IProvider) => {
    onProviderSelect(provider);
  };

  const handleApproveKYC = (providerId: string) => {
    // TODO: Implement approve KYC functionality
    console.log('Approving KYC for provider:', providerId);
  };

  const handleRejectKYC = (providerId: string) => {
    // TODO: Implement reject KYC functionality
    console.log('Rejecting KYC for provider:', providerId);
  };

  const handleBlockProvider = (providerId: string) => {
    // TODO: Implement block provider functionality
    console.log('Blocking provider:', providerId);
  };

  const handleSuspendProvider = (providerId: string) => {
    // TODO: Implement suspend provider functionality
    console.log('Suspending provider:', providerId);
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
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
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
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Service Providers ({providers.length})</h3>
      </div>
      
      <div className="card-body p-0">
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
                      <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                        <KeenIcon icon="shop" className="text-primary text-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{provider.name}</div>
                        <div className="text-sm text-gray-500 hidden sm:block">Joined {provider.joinDate}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{provider.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="badge-outline">
                      {provider.serviceCategory}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{getKYCStatusBadge(provider.kycStatus)}</TableCell>
                  <TableCell className="hidden md:table-cell">{renderStars(provider.rating)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="text-center">
                      <div className="font-semibold">{provider.jobsCompleted}</div>
                      <div className="text-sm text-gray-500">jobs</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-center">
                      <div className="font-semibold">₹{provider.earnings.toLocaleString()}</div>
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
                              >
                                <KeenIcon icon="check-circle" className="me-2" />
                                Approve KYC
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRejectKYC(provider.id)}
                                className="text-danger"
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
                              >
                                <KeenIcon icon="cross-circle" className="me-2" />
                                Block Provider
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSuspendProvider(provider.id)}
                                className="text-warning"
                              >
                                <KeenIcon icon="minus-circle" className="me-2" />
                                Suspend Provider
                              </DropdownMenuItem>
                            </>
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
      </div>
    </div>
  );
};

export { ProviderManagementTable };
