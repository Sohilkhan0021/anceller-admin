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

interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  status: 'active' | 'blocked';
  joinDate: string;
  lastActive: string;
  totalSpent: number;
}

interface IUserManagementTableProps {
  onUserSelect: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
}

const UserManagementTable = ({ onUserSelect, onEditUser }: IUserManagementTableProps) => {

  // Mock data - in real app, this would come from API
  const users: IUser[] = [
    {
      id: 'USR001',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 234-567-8900',
      totalBookings: 12,
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-01-20',
      totalSpent: 2500
    },
    {
      id: 'USR002',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 234-567-8901',
      totalBookings: 8,
      status: 'active',
      joinDate: '2024-01-10',
      lastActive: '2024-01-19',
      totalSpent: 1800
    },
    {
      id: 'USR003',
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1 234-567-8902',
      totalBookings: 3,
      status: 'blocked',
      joinDate: '2024-01-05',
      lastActive: '2024-01-18',
      totalSpent: 450
    },
    {
      id: 'USR004',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1 234-567-8903',
      totalBookings: 15,
      status: 'active',
      joinDate: '2024-01-12',
      lastActive: '2024-01-20',
      totalSpent: 3200
    },
    {
      id: 'USR005',
      name: 'David Brown',
      email: 'david.brown@email.com',
      phone: '+1 234-567-8904',
      totalBookings: 5,
      status: 'active',
      joinDate: '2024-01-08',
      lastActive: '2024-01-17',
      totalSpent: 1200
    }
  ];

  const handleViewUser = (user: IUser) => {
    onUserSelect(user);
  };

  const handleBlockUser = (userId: string) => {
    // TODO: Implement block user functionality
    console.log('Blocking user:', userId);
  };

  const handleUnblockUser = (userId: string) => {
    // TODO: Implement unblock user functionality
    console.log('Unblocking user:', userId);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="destructive" className="badge-danger">Blocked</Badge>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Users ({users.length})</h3>
      </div>
      
      <div className="card-body p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead className="hidden sm:table-cell">Bookings</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="hidden sm:table-cell font-medium">{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                        <KeenIcon icon="user" className="text-primary text-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-sm text-gray-500 hidden sm:block">Joined {user.joinDate}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="truncate max-w-[200px]" title={user.email}>
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{user.phone}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="text-center">
                      <div className="font-semibold">{user.totalBookings}</div>
                      <div className="text-sm text-gray-500">₹{user.totalSpent}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="md:hidden">
                        {getStatusBadge(user.status)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <KeenIcon icon="dots-vertical" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <KeenIcon icon="eye" className="me-2" />
                            View Details
                          </DropdownMenuItem>
                          {onEditUser && (
                            <DropdownMenuItem onClick={() => onEditUser(user)}>
                              <KeenIcon icon="notepad-edit" className="me-2" />
                              Edit User
                            </DropdownMenuItem>
                          )}
                          {user.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => handleBlockUser(user.id)}
                              className="text-danger"
                            >
                              <KeenIcon icon="cross-circle" className="me-2" />
                              Block User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleUnblockUser(user.id)}
                              className="text-success"
                            >
                              <KeenIcon icon="check-circle" className="me-2" />
                              Unblock User
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
      </div>
    </div>
  );
};

export { UserManagementTable };




