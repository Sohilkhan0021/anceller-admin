import { useState } from 'react';
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
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface IRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

interface IPermission {
  module: string;
  actions: string[];
}

interface IRoleManagementProps {
  isAddRoleOpen?: boolean;
  onCloseAddRole?: () => void;
}

const RoleManagement = ({ isAddRoleOpen = false, onCloseAddRole }: IRoleManagementProps) => {
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    email: '',
    permissions: [] as string[]
  });

  // Mock data - in real app, this would come from API
  const roles: IRole[] = [
    {
      id: 'super-admin',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: ['users:view', 'users:edit', 'users:delete', 'providers:view', 'providers:edit', 'providers:approve', 'bookings:view', 'bookings:edit', 'payments:view', 'payments:edit', 'system:view', 'system:edit'],
      userCount: 2,
      createdAt: '2024-01-01',
      status: 'active'
    },
    {
      id: 'support',
      name: 'Support',
      description: 'Customer support and ticket management',
      permissions: ['users:view', 'bookings:view', 'bookings:edit', 'tickets:view', 'tickets:edit'],
      userCount: 5,
      createdAt: '2024-01-05',
      status: 'active'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Financial operations and payment management',
      permissions: ['payments:view', 'payments:edit', 'reports:view', 'payouts:view', 'payouts:edit'],
      userCount: 3,
      createdAt: '2024-01-10',
      status: 'active'
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Provider and booking management',
      permissions: ['providers:view', 'providers:edit', 'providers:approve', 'bookings:view', 'bookings:edit', 'catalog:view', 'catalog:edit'],
      userCount: 4,
      createdAt: '2024-01-15',
      status: 'active'
    }
  ];

  const permissions: IPermission[] = [
    {
      module: 'Users',
      actions: ['users:view', 'users:edit', 'users:delete']
    },
    {
      module: 'Providers',
      actions: ['providers:view', 'providers:edit', 'providers:approve']
    },
    {
      module: 'Bookings',
      actions: ['bookings:view', 'bookings:edit', 'bookings:delete']
    },
    {
      module: 'Payments',
      actions: ['payments:view', 'payments:edit', 'payouts:view', 'payouts:edit']
    },
    {
      module: 'Catalog',
      actions: ['catalog:view', 'catalog:edit', 'pricing:view', 'pricing:edit']
    },
    {
      module: 'System',
      actions: ['system:view', 'system:edit', 'logs:view']
    }
  ];

  const handleAddRole = () => {
    setSelectedRole(null);
    setNewRole({ name: '', description: '', email: '', permissions: [] });
    // The modal will be opened by the parent component
  };

  const handleEditRole = (role: IRole) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      email: '',
      permissions: role.permissions
    });
    // The modal will be opened by the parent component
  };

  const handlePermissionToggle = (permission: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSaveRole = () => {
    // TODO: Implement save role functionality
    console.log('Saving role:', newRole);
    onCloseAddRole?.();
    setSelectedRole(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default', className: 'bg-success text-white', text: 'Active' },
      inactive: { variant: 'destructive', className: '', text: 'Inactive' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Role List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Role Management</h3>
          <p className="text-sm text-gray-600">Manage admin roles and permissions</p>
        </div>
        
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] sm:w-[250px]">Role</TableHead>
                  <TableHead className="hidden md:table-cell w-[200px]">Description</TableHead>
                  <TableHead className="hidden sm:table-cell w-[100px]">Users</TableHead>
                  <TableHead className="hidden lg:table-cell w-[120px]">Permissions</TableHead>
                  <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="w-[200px] sm:w-[250px]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                          <KeenIcon icon="security-user" className="text-primary text-xs" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate text-sm">{role.name}</div>
                          <div className="text-xs text-gray-500 hidden sm:block">Created {role.createdAt}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{role.userCount} users</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell w-[200px]">
                      <div className="max-w-xs">
                        <div className="truncate text-sm" title={role.description}>
                          {role.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell w-[100px]">
                      <div className="text-center">
                        <div className="font-semibold text-sm">{role.userCount}</div>
                        <div className="text-xs text-gray-500">users</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell w-[120px]">
                      <div className="text-center">
                        <div className="font-semibold text-sm">{role.permissions.length}</div>
                        <div className="text-xs text-gray-500">permissions</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell w-[100px]">{getStatusBadge(role.status)}</TableCell>
                    <TableCell className="w-[80px]">
                      <div className="flex items-center justify-end">
                        <div className="flex flex-col gap-1 sm:hidden mr-1">
                          <div className="md:hidden">
                            <div className="text-xs text-gray-500">{role.permissions.length} perms</div>
                          </div>
                          <div className="sm:hidden">
                            {getStatusBadge(role.status)}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleEditRole(role)} className="flex-shrink-0 p-1">
                          <KeenIcon icon="pencil" className="text-sm" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Permission Matrix</h3>
          <p className="text-sm text-gray-600">View permissions by role</p>
        </div>
        
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] sm:w-[150px]">Module</TableHead>
                  <TableHead className="hidden sm:table-cell w-[100px]">Super Admin</TableHead>
                  <TableHead className="hidden sm:table-cell w-[100px]">Support</TableHead>
                  <TableHead className="hidden sm:table-cell w-[100px]">Finance</TableHead>
                  <TableHead className="hidden sm:table-cell w-[100px]">Operations</TableHead>
                  <TableHead className="w-[200px] sm:hidden">Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.module}>
                    <TableCell className="w-[120px] sm:w-[150px] font-medium text-sm">{permission.module}</TableCell>
                    {['super-admin', 'support', 'finance', 'operations'].map((roleId) => {
                      const role = roles.find(r => r.id === roleId);
                      const hasPermission = role?.permissions.some(p => permission.actions.some(action => p.includes(action.split(':')[0])));
                      return (
                        <TableCell key={roleId} className="hidden sm:table-cell w-[100px]">
                          <div className="flex items-center justify-center">
                            {hasPermission ? (
                              <KeenIcon icon="check-circle" className="text-success text-sm" />
                            ) : (
                              <KeenIcon icon="cross-circle" className="text-gray-400 text-sm" />
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="w-[200px] sm:hidden">
                      <div className="flex flex-wrap gap-1">
                        {['super-admin', 'support', 'finance', 'operations'].map((roleId) => {
                          const role = roles.find(r => r.id === roleId);
                          const hasPermission = role?.permissions.some(p => permission.actions.some(action => p.includes(action.split(':')[0])));
                          const roleName = roleId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                          return (
                            <div key={roleId} className="flex items-center gap-1 text-xs">
                              <span className="text-gray-600">{roleName}:</span>
                              {hasPermission ? (
                                <KeenIcon icon="check-circle" className="text-success text-xs" />
                              ) : (
                                <KeenIcon icon="cross-circle" className="text-gray-400 text-xs" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add/Edit Role Modal */}
      <Dialog open={isAddRoleOpen} onOpenChange={onCloseAddRole}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="security-user" className="text-primary" />
            {selectedRole ? 'Edit Role' : 'Add New Role'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({...prev, name: e.target.value}))}
                  className="mt-2"
                  placeholder="Enter role name..."
                />
              </div>
              
              <div>
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={newRole.email}
                  onChange={(e) => setNewRole(prev => ({...prev, email: e.target.value}))}
                  className="mt-2"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role-description">Description</Label>
              <textarea
                id="role-description"
                value={newRole.description}
                onChange={(e) => setNewRole(prev => ({...prev, description: e.target.value}))}
                className="mt-2 w-full p-3 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Enter role description..."
              />
            </div>

            {/* Permissions */}
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {permissions.map((permission) => (
                  <div key={permission.module} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{permission.module}</h4>
                    <div className="space-y-2">
                      {permission.actions.map((action) => (
                        <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                            id={action}
                            checked={newRole.permissions.includes(action)}
                            onCheckedChange={() => handlePermissionToggle(action)}
                          />
                          <Label htmlFor={action} className="text-sm">
                            {action.split(':')[1].charAt(0).toUpperCase() + action.split(':')[1].slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onCloseAddRole}>
                Cancel
              </Button>
              <Button onClick={handleSaveRole}>
                <KeenIcon icon="check" className="me-2" />
                {selectedRole ? 'Update Role' : 'Create Role'}
              </Button>
          </div>
          </div>
        </DialogBody>
      </DialogContent>
      </Dialog>
    </div>
  );
};

export { RoleManagement };


