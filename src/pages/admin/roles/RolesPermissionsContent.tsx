import { useState } from 'react';
import { RolesPermissionsHeader } from './blocks/RolesPermissionsHeader';
import { RoleManagement } from './blocks/RoleManagement';
import { ActivityLog } from './blocks/ActivityLog';
import { AssignRoleToUser } from './blocks/AssignRoleToUser';

const RolesPermissionsContent = () => {
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);

  const handleAddRole = () => {
    setIsAddRoleOpen(true);
  };

  const handleAssignUser = () => {
    setIsAssignUserOpen(true);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header */}
      <RolesPermissionsHeader 
        onAddRole={handleAddRole}
        onAssignUser={handleAssignUser}
      />

      {/* Role Management */}
      <RoleManagement isAddRoleOpen={isAddRoleOpen} onCloseAddRole={() => setIsAddRoleOpen(false)} />

      {/* Activity Log */}
      <ActivityLog />

      {/* Assign Role to User Modal */}
      <AssignRoleToUser 
        isOpen={isAssignUserOpen} 
        onClose={() => setIsAssignUserOpen(false)} 
      />
    </div>
  );
};

export { RolesPermissionsContent };


