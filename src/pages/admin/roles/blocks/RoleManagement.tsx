import React, { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRoles, usePermissions, useCreateRole, useUpdateRole, useDeleteRole } from '@/services';
import type { IRole, IPermissionModule } from '@/services/role.types';
import { format } from 'date-fns';

interface IRoleManagementProps {
  isAddRoleOpen?: boolean;
  onCloseAddRole?: () => void;
}

const RoleManagement = ({ isAddRoleOpen = false, onCloseAddRole }: IRoleManagementProps) => {
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<IRole | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as string[],
    is_active: true
  });

  // Fetch roles and permissions from API
  const { roles, isLoading: rolesLoading, isError: rolesError, error: rolesErrorObj, refetch: refetchRoles } = useRoles({
    page: 1,
    limit: 100, // Get all roles
  });

  const { permissions: permissionsData, isLoading: permissionsLoading } = usePermissions();

  // Mutations
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  // Sync with parent's isAddRoleOpen for "Add" button
  useEffect(() => {
    if (isAddRoleOpen) {
      setIsModalOpen(true);
      setSelectedRole(null);
      setNewRole({
        name: '',
        display_name: '',
        description: '',
        permissions: [],
        is_active: true
      });
    }
  }, [isAddRoleOpen]);

  // Reset form when modal closes
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setNewRole({
      name: '',
      display_name: '',
      description: '',
      permissions: [],
      is_active: true
    });
    onCloseAddRole?.();
  };

  const handleEditRole = (role: IRole) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      display_name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
      is_active: role.status === 'active'
    });
    setIsModalOpen(true); // Open the modal when editing
  };

  const handlePermissionToggle = (permission: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSaveRole = async () => {
    try {
      // Filter permissions to only include those that exist in the database
      const validPermissions = filterValidPermissions(newRole.permissions);

      // Warn if some permissions were filtered out
      if (validPermissions.length < newRole.permissions.length && validPermissionNames.length > 0) {
        const filteredOut = newRole.permissions.filter(p => !validPermissions.includes(p));
        console.warn('Some permissions were filtered out as they do not exist in the database:', filteredOut);
        // You could show a toast/alert here if needed
      }

      // If using hardcoded permissions and API is empty, warn user
      if (isUsingHardcodedPermissions && newRole.permissions.length > 0) {
        alert('Warning: Permissions need to be created in the database first. Please create permissions before assigning them to roles.');
        return;
      }

      if (selectedRole) {
        // Update existing role
        await updateRoleMutation.mutateAsync({
          roleId: selectedRole.role_id,
          roleData: {
            display_name: newRole.display_name || newRole.name,
            description: newRole.description,
            is_active: newRole.is_active,
            permissions: validPermissions
          }
        });
      } else {
        // Create new role
        await createRoleMutation.mutateAsync({
          name: newRole.name.toLowerCase().trim(),
          display_name: newRole.display_name || newRole.name,
          description: newRole.description,
          is_active: newRole.is_active,
          permissions: validPermissions
        });
      }
      handleCloseModal();
      refetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      // Error will be shown via the mutation error state
    }
  };

  const handleDeleteRole = (role: IRole) => {
    if (role.is_system) {
      alert('Cannot delete system role');
      return;
    }
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRoleMutation.mutateAsync(roleToDelete.role_id);
      refetchRoles();
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      // alert(error instanceof Error ? error.message : 'Failed to delete role');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default', className: 'bg-success text-white', text: 'Active' },
      inactive: { variant: 'destructive', className: '', text: 'Inactive' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Get all permission names from modules (from API)
  const getAllPermissionNames = (): string[] => {
    return permissionsData.flatMap(module => module.actions.map(action => action.permission));
  };

  // Get all permission names from hardcoded permissions
  const getHardcodedPermissionNames = (): string[] => {
    return hardcodedPermissions.flatMap(module => module.actions.map(action => action.permission));
  };

  // Filter permissions to only include those that exist in the database
  const filterValidPermissions = (permissions: string[]): string[] => {
    const validPermissions = getAllPermissionNames();
    // If we have API permissions, only use those
    if (validPermissions.length > 0) {
      return permissions.filter(p => validPermissions.includes(p));
    }
    // If no API permissions, return empty array (can't validate hardcoded ones)
    return [];
  };

  // Hardcoded permissions as fallback (old permissions structure)
  const hardcodedPermissions: IPermissionModule[] = [
    {
      module: 'Users',
      actions: [
        { permission_id: 'users:view', permission: 'users:view', name: 'View', description: 'View users' },
        { permission_id: 'users:edit', permission: 'users:edit', name: 'Edit', description: 'Edit users' },
        { permission_id: 'users:delete', permission: 'users:delete', name: 'Delete', description: 'Delete users' }
      ]
    },
    {
      module: 'Providers',
      actions: [
        { permission_id: 'providers:view', permission: 'providers:view', name: 'View', description: 'View providers' },
        { permission_id: 'providers:edit', permission: 'providers:edit', name: 'Edit', description: 'Edit providers' },
        { permission_id: 'providers:approve', permission: 'providers:approve', name: 'Approve', description: 'Approve providers' }
      ]
    },
    {
      module: 'Bookings',
      actions: [
        { permission_id: 'bookings:view', permission: 'bookings:view', name: 'View', description: 'View bookings' },
        { permission_id: 'bookings:edit', permission: 'bookings:edit', name: 'Edit', description: 'Edit bookings' },
        { permission_id: 'bookings:delete', permission: 'bookings:delete', name: 'Delete', description: 'Delete bookings' }
      ]
    },
    {
      module: 'Payments',
      actions: [
        { permission_id: 'payments:view', permission: 'payments:view', name: 'View', description: 'View payments' },
        { permission_id: 'payments:edit', permission: 'payments:edit', name: 'Edit', description: 'Edit payments' },
        { permission_id: 'payouts:view', permission: 'payouts:view', name: 'View Payouts', description: 'View payouts' },
        { permission_id: 'payouts:edit', permission: 'payouts:edit', name: 'Edit Payouts', description: 'Edit payouts' }
      ]
    },
    {
      module: 'Catalog',
      actions: [
        { permission_id: 'catalog:view', permission: 'catalog:view', name: 'View', description: 'View catalog' },
        { permission_id: 'catalog:edit', permission: 'catalog:edit', name: 'Edit', description: 'Edit catalog' },
        { permission_id: 'pricing:view', permission: 'pricing:view', name: 'View Pricing', description: 'View pricing' },
        { permission_id: 'pricing:edit', permission: 'pricing:edit', name: 'Edit Pricing', description: 'Edit pricing' }
      ]
    },
    {
      module: 'System',
      actions: [
        { permission_id: 'system:view', permission: 'system:view', name: 'View', description: 'View system settings' },
        { permission_id: 'system:edit', permission: 'system:edit', name: 'Edit', description: 'Edit system settings' },
        { permission_id: 'logs:view', permission: 'logs:view', name: 'View Logs', description: 'View system logs' }
      ]
    },
    {
      module: 'Coupons',
      actions: [
        { permission_id: 'coupons:view', permission: 'coupons:view', name: 'View', description: 'View coupons' },
        { permission_id: 'coupons:edit', permission: 'coupons:edit', name: 'Edit', description: 'Edit coupons' },
        { permission_id: 'coupons:delete', permission: 'coupons:delete', name: 'Delete', description: 'Delete coupons' }
      ]
    },
    {
      module: 'Roles',
      actions: [
        { permission_id: 'roles:view', permission: 'roles:view', name: 'View', description: 'View roles' },
        { permission_id: 'roles:edit', permission: 'roles:edit', name: 'Edit', description: 'Edit roles' },
        { permission_id: 'roles:create', permission: 'roles:create', name: 'Create', description: 'Create roles' },
        { permission_id: 'roles:delete', permission: 'roles:delete', name: 'Delete', description: 'Delete roles' }
      ]
    }
  ];

  // Use API permissions if available, otherwise use hardcoded fallback
  // But only show permissions that exist in the database
  const displayPermissions = permissionsData.length > 0 ? permissionsData : hardcodedPermissions;

  // Get all valid permission names from database (for validation)
  const validPermissionNames = getAllPermissionNames();

  // Check if we're using hardcoded permissions (API returned empty)
  const isUsingHardcodedPermissions = permissionsData.length === 0 && !permissionsLoading;

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {rolesError && (
        <div className="card bg-danger-light border border-danger">
          <div className="card-body">
            <p className="text-danger">
              Error loading roles: {rolesErrorObj?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      )}

      {/* Role List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Role Management</h3>
          <p className="text-sm text-gray-600">Manage admin roles and permissions</p>
        </div>

        <div className="card-body p-0">
          {rolesLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-gray-600">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No roles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] sm:w-[250px]">Role</TableHead>
                    <TableHead className="hidden md:table-cell w-[200px]">Description</TableHead>
                    <TableHead className="hidden sm:table-cell w-[60px]">Users</TableHead>
                    <TableHead className="hidden lg:table-cell w-[120px]">Permissions</TableHead>
                    <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.role_id}>
                      <TableCell className="w-[200px] sm:w-[250px]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                            <KeenIcon icon="security-user" className="text-primary text-xs" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate text-sm">{role.name}</div>
                            <div className="text-xs text-gray-500 hidden sm:block">Created {formatDate(role.created_at)}</div>
                            <div className="text-xs text-gray-500 sm:hidden">{role.users_count} users</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell w-[200px]">
                        <div className="max-w-xs">
                          <div className="truncate text-sm" title={role.description || ''}>
                            {role.description || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell w-[100px]">
                        <div className="text-center">
                          <div className="font-semibold text-sm">{role.users_count}</div>
                          <div className="text-xs text-gray-500">users</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell w-[120px]">
                        <div className="text-center">
                          <div className="font-semibold text-sm">{role.permissions?.length || 0}</div>
                          <div className="text-xs text-gray-500">permissions</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell w-[100px]">{getStatusBadge(role.status)}</TableCell>
                      <TableCell className="w-[80px]">
                        <div className="flex items-center justify-end gap-1">
                          <div className="flex flex-col gap-1 sm:hidden mr-1">
                            <div className="md:hidden">
                              <div className="text-xs text-gray-500">{role.permissions?.length || 0} perms</div>
                            </div>
                            <div className="sm:hidden">
                              {getStatusBadge(role.status)}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRole(role)}
                            className="flex-shrink-0 p-1"
                          >
                            <KeenIcon icon="pencil" className="text-sm" />
                            Edit
                          </Button>
                          {!role.is_system && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteRole(role)}
                              className="flex-shrink-0 p-1 text-danger hover:text-danger"
                              disabled={deleteRoleMutation.isLoading}
                            >
                              <KeenIcon icon="trash" className="text-sm" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Permission Matrix */}
      {permissionsData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Permission Matrix</h3>
            <p className="text-sm text-gray-600">View permissions by role</p>
          </div>

          <div className="card-body p-0">
            {permissionsLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-gray-600">Loading permissions...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px] sm:w-[200px]">Permission</TableHead>
                      {roles.slice(0, 4).map((role) => (
                        <TableHead key={role.role_id} className="hidden sm:table-cell w-[120px] text-center">
                          {role.name}
                        </TableHead>
                      ))}
                      <TableHead className="w-[200px] sm:hidden">Permissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissionsData.map((permissionModule: IPermissionModule) => (
                      <React.Fragment key={permissionModule.module}>
                        {/* Module Header Row */}
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={roles.length + 1} className="font-semibold text-sm py-2">
                            {permissionModule.module}
                          </TableCell>
                        </TableRow>
                        {/* Permission Actions Rows */}
                        {permissionModule.actions.map((action) => (
                          <TableRow key={action.permission_id || action.permission}>
                            <TableCell className="w-[120px] sm:w-[200px] pl-6 sm:pl-8 text-sm text-gray-700 align-middle">
                              {action.name || action.permission.split(':')[1]?.charAt(0).toUpperCase() + action.permission.split(':')[1]?.slice(1) || action.permission}
                            </TableCell>
                            {roles.slice(0, 4).map((role) => {
                              const hasPermission = role.permissions?.includes(action.permission);
                              return (
                                <TableCell key={role.role_id} className="hidden sm:table-cell w-[120px] text-center align-middle">
                                  <div className="flex items-center justify-center h-full">
                                    {hasPermission ? (
                                      <KeenIcon icon="check-circle" className="text-success text-lg" />
                                    ) : (
                                      <KeenIcon icon="cross-circle" className="text-gray-300 text-lg" />
                                    )}
                                  </div>
                                </TableCell>
                              );
                            })}
                            <TableCell className="w-[200px] sm:hidden">
                              <div className="flex flex-wrap gap-2">
                                {roles.slice(0, 4).map((role) => {
                                  const hasPermission = role.permissions?.includes(action.permission);
                                  return (
                                    <div key={role.role_id} className="flex items-center gap-1 text-xs">
                                      <span className="text-gray-600 font-medium">{role.name}:</span>
                                      {hasPermission ? (
                                        <KeenIcon icon="check-circle" className="text-success text-sm" />
                                      ) : (
                                        <KeenIcon icon="cross-circle" className="text-gray-300 text-sm" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Role Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="security-user" className="text-primary" />
              {selectedRole ? 'Edit Role' : 'Add New Role'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-6">
              {/* Error Messages */}
              {(createRoleMutation.isError || updateRoleMutation.isError) && (
                <div className="p-3 bg-danger-light border border-danger rounded">
                  <p className="text-danger text-sm">
                    {createRoleMutation.error instanceof Error
                      ? createRoleMutation.error.message
                      : updateRoleMutation.error instanceof Error
                        ? updateRoleMutation.error.message
                        : 'An error occurred while saving the role'}
                  </p>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-name">Role Name {selectedRole ? '(Read-only)' : '*'}</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-2"
                    placeholder="Enter role name (e.g., manager)"
                    disabled={!!selectedRole}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role-display-name">Display Name</Label>
                  <Input
                    id="role-display-name"
                    value={newRole.display_name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, display_name: e.target.value }))}
                    className="mt-2"
                    placeholder="Enter display name (e.g., Manager)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role-description">Description</Label>
                <textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter role description..."
                />
              </div>

              {/* Status Toggle */}
              <div>
                <Label htmlFor="role-status">Status</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Checkbox
                    id="role-status"
                    checked={newRole.is_active}
                    onCheckedChange={(checked) => setNewRole(prev => ({ ...prev, is_active: checked as boolean }))}
                  />
                  <Label htmlFor="role-status" className="text-sm">
                    Active
                  </Label>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <Label>Permissions</Label>
                {permissionsLoading ? (
                  <div className="mt-4 p-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading permissions...</p>
                  </div>
                ) : isUsingHardcodedPermissions ? (
                  <div className="mt-4 p-4 bg-warning-light border border-warning rounded">
                    <p className="text-warning text-sm">
                      No permissions found in database. Please create permissions first before assigning them to roles.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {displayPermissions.map((permissionModule: IPermissionModule) => (
                      <div key={permissionModule.module} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">{permissionModule.module}</h4>
                        <div className="space-y-2">
                          {permissionModule.actions.map((action) => {
                            // Only show permissions that exist in the database
                            const isValid = validPermissionNames.length === 0 || validPermissionNames.includes(action.permission);
                            return (
                              <div key={action.permission_id || action.permission} className="flex items-center space-x-2">
                                <Checkbox
                                  id={action.permission}
                                  checked={newRole.permissions.includes(action.permission)}
                                  onCheckedChange={() => handlePermissionToggle(action.permission)}
                                  disabled={!isValid && validPermissionNames.length > 0}
                                />
                                <Label
                                  htmlFor={action.permission}
                                  className={`text-sm ${isValid || validPermissionNames.length === 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                >
                                  {action.name || action.permission.split(':')[1]?.charAt(0).toUpperCase() + action.permission.split(':')[1]?.slice(1) || action.permission}
                                  {!isValid && validPermissionNames.length > 0 && (
                                    <span className="text-xs text-gray-400 ml-1">(not in DB)</span>
                                  )}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={createRoleMutation.isLoading || updateRoleMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRole}
                  disabled={createRoleMutation.isLoading || updateRoleMutation.isLoading || !newRole.name.trim()}
                >
                  {createRoleMutation.isLoading || updateRoleMutation.isLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                      {selectedRole ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="check" className="me-2" />
                      {selectedRole ? 'Update Role' : 'Create Role'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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
              disabled={deleteRoleMutation.isLoading}
            >
              {deleteRoleMutation.isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { RoleManagement };


