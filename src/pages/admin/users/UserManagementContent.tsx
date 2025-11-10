import { useState } from 'react';
import { UserManagementHeader } from './blocks/UserManagementHeader';
import { UserManagementTable } from './blocks/UserManagementTable';
import { UserDetailModal } from './blocks/UserDetailModal';
import { AddUserForm } from './forms/AddUserForm';
import { EditUserForm } from './forms/EditUserForm';

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

const UserManagementContent = () => {
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<IUser | null>(null);

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

  const handleSaveUser = (userData: any) => {
    console.log('Saving user:', userData);
    // TODO: Implement API call to save user
    setIsAddFormOpen(false);
  };

  const handleUpdateUser = (userData: any) => {
    console.log('Updating user:', userData);
    // TODO: Implement API call to update user
    setIsEditFormOpen(false);
    setEditUser(null);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header with search and filters */}
      <UserManagementHeader onAddUser={handleAddUser} />

      {/* User Management Table */}
      <UserManagementTable 
        onUserSelect={handleUserSelect} 
        onEditUser={handleEditUser}
      />

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
