import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IUser, IPaginationMeta } from '@/services/user.types';
import { ContentLoader } from '@/components/loaders';
import { useUserManage } from '@/providers/userManageProvider';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';

interface IUserManagementTableProps {
  users: IUser[];
  pagination: IPaginationMeta | null;
  isLoading?: boolean;
  onUserSelect: Function;
  onEditUser?: Function;
  onPageChange?: Function;
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
          <EmptyState
            title="No users found"
            description="Try adjusting your search or filter criteria."
            icon="user"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <AdminDataTable>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead className="hidden sm:table-cell">User ID</TableHead> */}
                    <TableHead>Name</TableHead>
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

                            <div className="hidden text-sm text-muted-foreground sm:block">
                              Joined {formatDate(user.joined_at || user.joinDate)}
                            </div>
                            <div className="text-xs text-muted-foreground sm:hidden">
                              {user.email || 'N/A'}
                            </div>
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
                            phone = phone
                              .replace(/^\+91\s*/g, '')
                              .replace(/\s*\+91\s*/g, '')
                              .trim();
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
                      <TableCell className="hidden md:table-cell">
                        <StatusBadge
                          status={(user as any).is_deleted ? 'inactive' : user.status}
                          label={(user as any).is_deleted ? 'Deleted' : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <div className="md:hidden">
                            <StatusBadge
                              status={(user as any).is_deleted ? 'inactive' : user.status}
                              label={(user as any).is_deleted ? 'Deleted' : undefined}
                            />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open user actions</span>
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
              </AdminDataTable>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && onPageChange && (
              <AdminPagination
                page={pagination.page}
                total={pagination.total}
                totalPages={pagination.totalPages}
                limit={pagination.limit}
                onPageChange={onPageChange}
                isLoading={isLoading}
                itemLabel="users"
              />
            )}
          </>
        )}
      </div>

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={(open: boolean) => setDeleteDialogOpen(open)}
        title="Delete user"
        description={`Are you sure you want to delete "${userToDelete ? users.find((u) => (u.user_id || u.id) === userToDelete)?.name || 'this user' : 'this user'}"? This action cannot be undone.`}
        confirmText={isDeletingUser ? 'Deleting...' : 'Delete'}
        danger
        loading={isDeletingUser}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export { UserManagementTable };
