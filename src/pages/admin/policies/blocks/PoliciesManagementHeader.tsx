import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';

const PoliciesManagementHeader = () => {
  return (
    <div className="card">
      <div className="card-header flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <KeenIcon icon="note-2" className="text-primary text-2xl" />
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Policies & Content Management</h1>
            <p className="text-sm text-gray-600">Manage static content and platform policies</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button variant="outline" size="sm" className="flex-shrink-0">
            <KeenIcon icon="file-down" className="me-2" />
            Export Content
          </Button> */}
          <Button size="sm" className="flex-shrink-0">
            <KeenIcon icon="check" className="me-2" />
            Publish Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export { PoliciesManagementHeader };
