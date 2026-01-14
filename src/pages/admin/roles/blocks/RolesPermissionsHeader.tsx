import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';

interface IRolesPermissionsHeaderProps {
  onAddRole?: () => void;
  onAssignUser?: () => void;
}

const RolesPermissionsHeader = ({ onAddRole, onAssignUser }: IRolesPermissionsHeaderProps) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-row items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="security-user" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Roles & Permissions</h1>
              <p className="text-sm text-gray-600">Manage admin-level access controls</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <KeenIcon icon="file-down" className="me-2" />
              Export Roles
            </Button> */}
            <Button variant="outline" size="sm" onClick={onAssignUser} className="w-full sm:w-auto">
              <KeenIcon icon="user-square" className="me-2" />
              Assign Role to User
            </Button>
            <Button size="sm" onClick={onAddRole} className="w-full sm:w-auto">
              <KeenIcon icon="plus" className="me-2" />
              Add Role
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { RolesPermissionsHeader };


