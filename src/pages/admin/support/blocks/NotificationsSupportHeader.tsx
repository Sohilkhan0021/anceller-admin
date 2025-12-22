import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';

interface INotificationsSupportHeaderProps {
  onCreateTicket?: () => void;
  onAddUser?: () => void;
  onCreateAnnouncement?: () => void;
}

const NotificationsSupportHeader = ({ 
  onCreateTicket, 
  onAddUser, 
  onCreateAnnouncement 
}: INotificationsSupportHeaderProps) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeenIcon icon="notification" className="text-primary text-2xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Notifications & Support</h1>
              <p className="text-sm text-gray-600">Monitor user issues and send announcements</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:flex gap-3">
            {/* <Button variant="outline" size="sm" className="w-full">
              <KeenIcon icon="file-down" className="me-2" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </Button> */}
            <Button variant="outline" size="sm" onClick={onAddUser} className="w-full">
              <KeenIcon icon="user" className="me-2" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onCreateTicket} className="w-full">
              <KeenIcon icon="plus" className="me-2" />
              <span className="hidden sm:inline">New Ticket</span>
              <span className="sm:hidden">Ticket</span>
            </Button>
            <Button size="sm" onClick={onCreateAnnouncement} className="w-full col-span-2 lg:col-span-1">
              <KeenIcon icon="plus" className="me-2" />
              <span className="hidden sm:inline">Create Announcement</span>
              <span className="sm:hidden">Announcement</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { NotificationsSupportHeader };


