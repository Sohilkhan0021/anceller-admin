import { PoliciesManagementHeader } from './blocks/PoliciesManagementHeader';
import { PolicySections } from './blocks/PolicySections';
import { NotificationTemplates } from './blocks/NotificationTemplates';

const PoliciesManagementContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header */}
      <PoliciesManagementHeader />

      {/* Policy Sections */}
      <PolicySections />

      {/* Notification Templates */}
      <NotificationTemplates />
    </div>
  );
};

export { PoliciesManagementContent };


