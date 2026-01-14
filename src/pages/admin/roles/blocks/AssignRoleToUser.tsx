import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoles } from '@/services';
import { userService } from '@/services/user.service';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';

interface IAssignRoleToUserProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const AssignRoleToUser = ({ isOpen = false, onClose }: IAssignRoleToUserProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    first_name: '',
    last_name: '',
    phone_number: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();
  const { roles } = useRoles({ page: 1, limit: 100 });

  const createAdminUserMutation = useMutation(
    (data: typeof formData) => userService.createAdminUser({
      email: data.email,
      password: data.password,
      role: data.role,
      first_name: data.first_name || undefined,
      last_name: data.last_name || undefined,
      phone_number: data.phone_number || undefined,
      status: 'ACTIVE'
    }),
    {
      onSuccess: (response) => {
        if (response?.message) {
          toast.success(response.message);
        }
        queryClient.invalidateQueries(['users']);
        queryClient.invalidateQueries(['roles']);
        handleClose();
      },
    }
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createAdminUserMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error creating admin user:', error);
      // Error will be shown via mutation error state
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      first_name: '',
      last_name: '',
      phone_number: ''
    });
    setErrors({});
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="user-square" className="text-primary" />
            Create Admin User & Assign Role
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Messages */}
            {createAdminUserMutation.isError && (
              <div className="p-3 bg-danger-light border border-danger rounded">
                <p className="text-danger text-sm">
                  {createAdminUserMutation.error instanceof Error
                    ? createAdminUserMutation.error.message
                    : 'An error occurred while creating the user'}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-2"
                placeholder="user@example.com"
                required
              />
              {errors.email && (
                <p className="text-danger text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pr-10"
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <KeenIcon icon={showPassword ? 'eye-slash' : 'eye'} className="text-sm" />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-danger text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pr-10"
                    placeholder="Re-enter password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <KeenIcon icon={showConfirmPassword ? 'eye-slash' : 'eye'} className="text-sm" />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <Label htmlFor="role">Assign Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => {
                    // Use role_name if available (actual role name), otherwise fallback to name.toLowerCase()
                    const roleName = role.role_name || role.name.toLowerCase();
                    return (
                      <SelectItem key={role.role_id} value={roleName}>
                        {role.name} {role.is_system && '(System)'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-danger text-xs mt-1">{errors.role}</p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="mt-2"
                  placeholder="John"
                />
              </div>

              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="mt-2"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                className="mt-2"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createAdminUserMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createAdminUserMutation.isLoading}
              >
                {createAdminUserMutation.isLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <KeenIcon icon="check" className="me-2" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AssignRoleToUser };

