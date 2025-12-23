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

const UserManagementTable = ({
  users,
  pagination,
  isLoading = false,
  onUserSelect,
  onEditUser,
  onPageChange
}: IUserManagementTableProps) => {

  const { updateUserStatus } = useUserManage();

  const handleViewUser = (user: IUser) => {
    onUserSelect(user);
  };

  const handleBlockUser = async (userId: string) => {
    await updateUserStatus(userId, 'SUSPENDED');
  };

  const handleUnblockUser = async (userId: string) => {
    await updateUserStatus(userId, 'ACTIVE');
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
                    <TableHead className="hidden sm:table-cell">Bookings</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      {/* <TableCell className="hidden sm:table-cell font-medium">{user.id}</TableCell> */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                            <KeenIcon icon="user" className="text-primary text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{user.name || 'N/A'}</div>
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
                      <TableCell className="hidden lg:table-cell">{user.phone || 'N/A'}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-center">
                          <div className="font-semibold">{user.totalBookings || 0}</div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(user.totalSpent || 0)}
                          </div>
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
    </div>
  );
};

export { UserManagementTable };




