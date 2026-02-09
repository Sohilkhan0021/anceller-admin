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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { IUser, IPaginationMeta } from '@/services/user.types';
import { ContentLoader } from '@/components/loaders';
import { useUserManage } from '@/providers/userManageProvider';

interface IUserManagementTableProps {
  users: IUser[];
  pagination: IPaginationMeta | null;
  isLoading?: boolean;
  onUserSelect: (user: IUser) => void;
  onEditUser?: (user: IUser) => void;
  onPageChange?: (page: number) => void;
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};


const UserManagementTable = ({
  users,
  pagination,
  isLoading = false,
  onUserSelect,
  onEditUser,
  onPageChange
}: IUserManagementTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { updateUserStatus, deleteUser, isDeletingUser } = useUserManage();

  const handleViewUser = (user: IUser) => {
    onUserSelect(user);
  };

  const handleBlockUser = async (userId: string) => {
    await updateUserStatus(userId, 'SUSPENDED');
  };

  const handleUnblockUser = async (userId: string) => {
    await updateUserStatus(userId, 'ACTIVE');
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        // Error is handled by provider (toast)
        console.error('Failed to delete user:', error);
      }
    }
  };


  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'ACTIVE') {
      return <Badge variant="default" className="bg-success text-white">Active</Badge>;
    } else if (s === 'BLOCKED') {
      return <Badge variant="destructive" className="badge-danger">Blocked</Badge>;
    } else {
      return <Badge variant="outline">Inactive</Badge>;
    }
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
      currencyDisplay: 'symbol', // Ensure ₹ symbol is displayed
    }).format(amount);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          Users {pagination ? `(${pagination.total})` : `(${users.length})`}
        </h3>
      </div>

      <div className="card-body p-0">
        {isLoading ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <KeenIcon icon="user" className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead className="hidden sm:table-cell">User ID</TableHead> */}
                    <TableHead className='pl-8'>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.user_id || user.id || `user-${index}`}>
                      {/* <TableCell className="hidden sm:table-cell font-medium">{user.id}</TableCell> */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                            <KeenIcon icon="user" className="text-primary text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            {/* <div className="font-medium truncate">{user.name || 'N/A'}</div> */}
                            <div className="font-medium" title={user.name}>
                              {truncateText(user.name || 'N/A', 30)}
                            </div>

                            <div className="text-sm text-gray-500 hidden sm:block">
                              Joined {formatDate(user.joined_at || user.joinDate)}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">{user.email || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="truncate max-w-[200px]" title={user.email}>
                          {user.email || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {(() => {
                          let phone = user.phone || 'N/A';
                          if (phone && phone !== 'N/A' && typeof phone === 'string') {
                            // Remove duplicate +91 prefixes
                            phone = phone.replace(/^\+91\s*/g, '').replace(/\s*\+91\s*/g, '').trim();
                            // If it still starts with +91, remove it one more time
                            if (phone.startsWith('+91')) {
                              phone = phone.substring(3).trim();
                            }
                            // Display with single +91 prefix
                            return phone ? `+91${phone}` : 'N/A';
                          }
                          return phone;
                        })()}
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
                              {/* {user.status === 'active' ? ( */}
                              {user.status?.toLowerCase() === 'active' ? (
                                <DropdownMenuItem
                                  onClick={() => handleBlockUser(user.user_id || user.id)}
                                  className="text-danger"
                                >
                                  <KeenIcon icon="cross-circle" className="me-2" />
                                  Block User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleUnblockUser(user.user_id || user.id)}
                                  className="text-success"
                                >
                                  <KeenIcon icon="check-circle" className="me-2" />
                                  Unblock User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(user.user_id || user.id)}
                                className="text-danger"
                              >
                                <KeenIcon icon="trash" className="me-2" />
                                Delete User
                              </DropdownMenuItem>

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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} users
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="trash" className="text-danger" />
              Delete User
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the user <strong className="text-black">"{userToDelete ? users.find(u => (u.user_id || u.id) === userToDelete)?.name || 'this user' : 'this user'}"</strong>?
              This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingUser}
            >
              <KeenIcon icon="trash" className="me-2" />
              {isDeletingUser ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { UserManagementTable };




