import { useState } from 'react';
import { RolesPermissionsHeader } from './blocks/RolesPermissionsHeader';
import { RoleManagement } from './blocks/RoleManagement';
import { ActivityLog } from './blocks/ActivityLog';

const RolesPermissionsContent = () => {
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  const handleAddRole = () => {
    setIsAddRoleOpen(true);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header */}
      <RolesPermissionsHeader onAddRole={handleAddRole} />

      {/* Role Management */}
      <RoleManagement isAddRoleOpen={isAddRoleOpen} onCloseAddRole={() => setIsAddRoleOpen(false)} />

      {/* Activity Log */}
      <ActivityLog />
    </div>
  );
};

export { RolesPermissionsContent };


