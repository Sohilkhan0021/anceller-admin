import { useState, useCallback } from 'react';
import { UserManagementHeader } from './blocks/UserManagementHeader';
import { UserManagementTable } from './blocks/UserManagementTable';
import { UserDetailModal } from './blocks/UserDetailModal';
import { AddUserForm } from './forms/AddUserForm';
import { EditUserForm } from './forms/EditUserForm';
import { useUsers } from '@/services';
import { IUser } from '@/services/user.types';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { useUserManage } from '@/providers/userManageProvider';

const UserManagementContent = () => {
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<IUser | null>(null);

  // Filter state
  const [filters, setFilters] = useState<{ search: string; status: string }>({
    search: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { createUser, updateUser } = useUserManage();

  // Fetch users with filters
  const {
    users,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useUsers({
    page: currentPage,
    limit: pageSize,
    status: filters.status,
    search: filters.search,
  });

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: { search: string; status: string }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleUserSelect = (user: IUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    setIsAddFormOpen(true);
  };

  const handleEditUser = (user: IUser) => {
    setEditUser(user);
    setIsEditFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setEditUser(null);
  };

  const handleSaveUser = async (userData: any) => {
    await createUser(userData);
    // Form closing is handled in AddUserForm via onClose() after successful await
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      const userId = userData.user_id || userData.id;
      if (!userId) {
        console.error('User ID is missing');
        return;
      }
      
      // Transform form data to API format
      const updateData: any = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone_number: userData.phone,
      };
      
      // Add optional fields
      if (userData.address) updateData.address = userData.address;
      if (userData.city) updateData.city = userData.city;
      if (userData.state) updateData.state = userData.state;
      if (userData.pincode) updateData.pincode = userData.pincode;
      if (userData.notes) updateData.notes = userData.notes;
      if (userData.status) updateData.status = userData.status;
      if (typeof userData.isVerified === 'boolean') {
        updateData.is_verified = userData.isVerified;
      }
      
      await updateUser(userId, updateData);
      setIsEditFormOpen(false);
      setEditUser(null);
      refetch();
    } catch (error) {
      // Error is handled by provider (toast)
      console.error('Failed to update user:', error);
    }
  };


  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header with search and filters */}
      <UserManagementHeader
        onAddUser={handleAddUser}
        onFiltersChange={handleFiltersChange}
        initialSearch={filters.search}
        initialStatus={filters.status || 'all'}
      />

      {/* Error State */}
      {isError && (
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>
              {error?.message || 'Failed to load users. Please try again.'}
            </span>
            <button
              onClick={() => refetch()}
              className="text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !isFetching ? (
        <div className="card">
          <div className="card-body">
            <ContentLoader />
          </div>
        </div>
      ) : (
        /* User Management Table */
        <UserManagementTable
          users={users}
          pagination={pagination}
          isLoading={isFetching}
          onUserSelect={handleUserSelect}
          onEditUser={handleEditUser}
          onPageChange={setCurrentPage}
        />
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Add User Form */}
      <AddUserForm
        isOpen={isAddFormOpen}
        onClose={handleCloseAddForm}
        onSave={handleSaveUser}
      />

      {/* Edit User Form */}
      <EditUserForm
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        onSave={handleUpdateUser}
        userData={editUser}
      />
    </div>
  );
};

export { UserManagementContent };
