import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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

interface IAnnouncement {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'users' | 'providers';
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  sentAt: string;
  recipients: number;
}

interface IAnnouncementsProps {
  onCreateAnnouncement?: () => void;
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
  onSaveAnnouncement?: (announcementData: any) => void;
}

const Announcements = ({ onCreateAnnouncement, isCreateModalOpen, onCloseCreateModal, onSaveAnnouncement }: IAnnouncementsProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    target: 'all' as 'all' | 'users' | 'providers'
  });

  // Mock data - in real app, this would come from API
  const announcements: IAnnouncement[] = [
    {
      id: 'ANN001',
      title: 'System Maintenance Notice',
      message: 'We will be performing scheduled maintenance on Sunday, January 28th from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.',
      target: 'all',
      status: 'sent',
      createdAt: '2024-01-20 10:00 AM',
      sentAt: '2024-01-20 10:05 AM',
      recipients: 1250
    },
    {
      id: 'ANN002',
      title: 'New Feature Release',
      message: 'We are excited to announce the launch of our new booking system with improved user experience and faster processing.',
      target: 'users',
      status: 'sent',
      createdAt: '2024-01-19 2:30 PM',
      sentAt: '2024-01-19 2:35 PM',
      recipients: 850
    },
    {
      id: 'ANN003',
      title: 'Provider Training Session',
      message: 'Join us for a training session on new service protocols and best practices. Session will be held on January 25th at 3:00 PM.',
      target: 'providers',
      status: 'scheduled',
      createdAt: '2024-01-20 9:00 AM',
      sentAt: '2024-01-25 3:00 PM',
      recipients: 0
    },
    {
      id: 'ANN004',
      title: 'Payment Gateway Update',
      message: 'We have updated our payment processing system for better security and faster transactions.',
      target: 'all',
      status: 'draft',
      createdAt: '2024-01-20 11:30 AM',
      sentAt: '',
      recipients: 0
    }
  ];

  const handleCreateAnnouncement = () => {
    setNewAnnouncement({ title: '', message: '', target: 'all' });
    setIsCreateOpen(true);
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleSendAnnouncement = () => {
    if (onSaveAnnouncement) {
      onSaveAnnouncement(newAnnouncement);
      setNewAnnouncement({ title: '', message: '', target: 'all' });
    } else {
      // TODO: Implement send announcement functionality
      console.log('Sending announcement:', newAnnouncement);
      setIsCreateOpen(false);
      setNewAnnouncement({ title: '', message: '', target: 'all' });
    }
  };

  const handleEditAnnouncement = (announcement: IAnnouncement) => {
    setNewAnnouncement({
      title: announcement.title,
      message: announcement.message,
      target: announcement.target
    });
    setIsCreateOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary', className: '', text: 'Draft' },
      sent: { variant: 'default', className: 'bg-success text-white', text: 'Sent' },
      scheduled: { variant: 'default', className: 'bg-info text-white', text: 'Scheduled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getTargetBadge = (target: string) => {
    const targetConfig = {
      all: { variant: 'default', className: 'bg-primary text-white', text: 'All Users' },
      users: { variant: 'default', className: 'bg-info text-white', text: 'Users Only' },
      providers: { variant: 'default', className: 'bg-warning text-white', text: 'Providers Only' }
    };
    
    const config = targetConfig[target as keyof typeof targetConfig] || { variant: 'secondary', className: '', text: target };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="card-title">Announcements ({announcements.length})</h3>
            <p className="text-sm text-gray-600">Create and manage platform announcements</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <KeenIcon icon="file-down" className="me-2" />
              Export
            </Button>
            <Button size="sm" onClick={onCreateAnnouncement || handleCreateAnnouncement}>
              <KeenIcon icon="plus" className="me-2" />
              Create Announcement
            </Button>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell w-[150px]">Title</TableHead>
                <TableHead className="w-[200px] sm:w-[250px]">Announcement</TableHead>
                <TableHead className="hidden md:table-cell w-[100px]">Target</TableHead>
                <TableHead className="hidden lg:table-cell w-[100px]">Status</TableHead>
                <TableHead className="hidden sm:table-cell w-[100px]">Recipients</TableHead>
                <TableHead className="hidden md:table-cell w-[120px]">Created</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="hidden sm:table-cell w-[150px]">
                    <div className="font-medium text-sm">{announcement.title}</div>
                    <div className="text-xs text-gray-500">{announcement.createdAt}</div>
                  </TableCell>
                  <TableCell className="w-[200px] sm:w-[250px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                        <KeenIcon icon="notification" className="text-primary text-xs" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate text-sm" title={announcement.title}>
                          {announcement.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate" title={announcement.message}>
                          {announcement.message}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="sm:hidden">
                            {getTargetBadge(announcement.target)}
                          </div>
                          <div className="md:hidden">
                            {getStatusBadge(announcement.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell w-[100px]">{getTargetBadge(announcement.target)}</TableCell>
                  <TableCell className="hidden lg:table-cell w-[100px]">{getStatusBadge(announcement.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell w-[100px]">
                    <div className="text-center">
                      <div className="font-semibold text-sm">{announcement.recipients.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">recipients</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell w-[120px]">
                    <div className="text-sm">
                      <div>{announcement.createdAt}</div>
                      {announcement.sentAt && (
                        <div className="text-gray-500">Sent: {announcement.sentAt}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-[80px]">
                    <div className="flex items-center justify-end">
                      <div className="flex flex-col gap-1 sm:hidden mr-1">
                        <div className="lg:hidden">
                          {getTargetBadge(announcement.target)}
                        </div>
                        <div className="md:hidden">
                          {getStatusBadge(announcement.status)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditAnnouncement(announcement)} className="text-xs flex-shrink-0 p-1">
                          <KeenIcon icon="pencil" className="text-sm" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handlePreview} className="text-xs flex-shrink-0 p-1">
                          <KeenIcon icon="eye" className="text-sm" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Announcement Modal */}
      <Dialog open={isCreateModalOpen !== undefined ? isCreateModalOpen : isCreateOpen} onOpenChange={onCloseCreateModal || setIsCreateOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="notification" className="text-primary" />
              Create Announcement
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="px-6 pb-6">
            <div className="space-y-6">
            <div>
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({...prev, title: e.target.value}))}
                className="mt-2"
                placeholder="Enter announcement title..."
              />
            </div>

            <div>
              <Label htmlFor="announcement-target">Send To</Label>
              <Select value={newAnnouncement.target} onValueChange={(value: 'all' | 'users' | 'providers') => setNewAnnouncement(prev => ({...prev, target: value}))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="users">Users Only</SelectItem>
                  <SelectItem value="providers">Providers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="announcement-message">Message</Label>
              <Textarea
                id="announcement-message"
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement(prev => ({...prev, message: e.target.value}))}
                rows={6}
                className="mt-2"
                placeholder="Enter announcement message..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                <KeenIcon icon="cross" className="me-2" />
                Cancel
              </Button>
              <Button variant="outline" onClick={handlePreview}>
                <KeenIcon icon="eye" className="me-2" />
                Preview
              </Button>
              <Button onClick={handleSendAnnouncement}>
                <KeenIcon icon="rocket" className="me-2" />
                Send Announcement
              </Button>
            </div>
          </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle>Announcement Preview</DialogTitle>
          </DialogHeader>

          <DialogBody className="px-6 pb-6">
            <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{newAnnouncement.title}</h3>
              <p className="text-gray-700">{newAnnouncement.message}</p>
              <div className="mt-3 text-sm text-gray-500">
                Target: {newAnnouncement.target}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                <KeenIcon icon="cross" className="me-2" />
                Close
              </Button>
              <Button onClick={handleSendAnnouncement}>
                <KeenIcon icon="rocket" className="me-2" />
                Send Now
              </Button>
            </div>
          </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { Announcements };


