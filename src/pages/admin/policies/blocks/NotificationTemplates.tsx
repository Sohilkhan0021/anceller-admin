import { useState, useMemo } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tabs,
  TabPanel,
  TabsList,
  Tab,
} from '@/components/tabs';
import {
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate
} from '@/services/template.hooks';
import { TemplateChannel, ITemplate } from '@/services/template.types';
import { Skeleton } from '@/components/ui/skeleton';

// interface INotificationTemplate {
//   id: string;
//   name: string;
//   type: 'email' | 'sms' | 'push';
//   subject: string;
//   content: string;
//   variables: string[];
//   status: 'active' | 'inactive' | 'draft';
//   lastModified: string;
//   modifiedBy: string;
// }

const NotificationTemplates = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ITemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    channel: 'EMAIL' as TemplateChannel,
    subject: '',
    body: '',
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // API Hooks
  const { templates: emailTemplates, isLoading: isEmailLoading, refetch: refetchEmail } = useTemplates({ channel: 'EMAIL' });
  const { templates: smsTemplates, isLoading: isSmsLoading, refetch: refetchSms } = useTemplates({ channel: 'SMS' });
  const { templates: pushTemplates, isLoading: isPushLoading, refetch: refetchPush } = useTemplates({ channel: 'PUSH' });

  const createMutation = useCreateTemplate({
    onSuccess: () => {
      toast.success('Template created successfully');
      handleCloseAddForm();
      refetchAll();
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const updateMutation = useUpdateTemplate({
    onSuccess: () => {
      toast.success('Template updated successfully');
      setIsEditorOpen(false);
      refetchAll();
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const deleteMutation = useDeleteTemplate({
    onSuccess: () => {
      toast.success('Template deleted successfully');
      refetchAll();
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const refetchAll = () => {
    refetchEmail();
    refetchSms();
    refetchPush();
  };

  // Mock data - in real app, this would come from API
  /*
  const emailTemplates: INotificationTemplate[] = [
    {
      id: 'booking-confirmation',
      name: 'Booking Confirmation',
      type: 'email',
      subject: 'Booking Confirmed - {{service_name}}',
      content: 'Dear {{customer_name}}, your booking for {{service_name}} has been confirmed for {{booking_date}} at {{booking_time}}.',
      variables: ['customer_name', 'service_name', 'booking_date', 'booking_time'],
      status: 'active',
      lastModified: '2024-01-20',
      modifiedBy: 'Admin User'
    },
    {
      id: 'job-completion',
      name: 'Job Completion',
      type: 'email',
      subject: 'Service Completed - {{service_name}}',
      content: 'Dear {{customer_name}}, your {{service_name}} has been completed successfully. Please rate your experience.',
      variables: ['customer_name', 'service_name'],
      status: 'active',
      lastModified: '2024-01-18',
      modifiedBy: 'Admin User'
    },
    {
      id: 'payment-receipt',
      name: 'Payment Receipt',
      type: 'email',
      subject: 'Payment Receipt - {{amount}}',
      content: 'Dear {{customer_name}}, payment of {{amount}} has been received for {{service_name}}. Transaction ID: {{transaction_id}}',
      variables: ['customer_name', 'amount', 'service_name', 'transaction_id'],
      status: 'active',
      lastModified: '2024-01-15',
      modifiedBy: 'Admin User'
    }
  ];

  const smsTemplates: INotificationTemplate[] = [
    {
      id: 'booking-confirmation-sms',
      name: 'Booking Confirmation SMS',
      type: 'sms',
      subject: '',
      content: 'Hi {{customer_name}}, your {{service_name}} booking is confirmed for {{booking_date}}. Provider: {{provider_name}}',
      variables: ['customer_name', 'service_name', 'booking_date', 'provider_name'],
      status: 'active',
      lastModified: '2024-01-20',
      modifiedBy: 'Admin User'
    },
    {
      id: 'job-completion-sms',
      name: 'Job Completion SMS',
      type: 'sms',
      subject: '',
      content: 'Service completed! Please rate your experience: {{rating_link}}',
      variables: ['rating_link'],
      status: 'active',
      lastModified: '2024-01-18',
      modifiedBy: 'Admin User'
    }
  ];

  const pushTemplates: INotificationTemplate[] = [
    {
      id: 'booking-confirmation-push',
      name: 'Booking Confirmation Push',
      type: 'push',
      subject: 'Booking Confirmed',
      content: 'Your {{service_name}} booking is confirmed for {{booking_date}}',
      variables: ['service_name', 'booking_date'],
      status: 'active',
      lastModified: '2024-01-20',
      modifiedBy: 'Admin User'
    },
    {
      id: 'payment-receipt-push',
      name: 'Payment Receipt Push',
      type: 'push',
      subject: 'Payment Received',
      content: 'Payment of {{amount}} received for {{service_name}}',
      variables: ['amount', 'service_name'],
      status: 'active',
      lastModified: '2024-01-15',
      modifiedBy: 'Admin User'
    }
  ];
  */

  const handleEditTemplate = (template: ITemplate) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleAddTemplate = () => {
    setNewTemplate({
      name: '',
      channel: activeTab.toUpperCase() as TemplateChannel,
      subject: '',
      body: '',
    });
    setIsAddFormOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    // Subject validation for all channels
    if (!editingTemplate.subject?.trim()) {
      toast.error('Subject is required');
      return;
    }

    updateMutation.mutate({
      id: editingTemplate.template_id,
      data: {
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        body: editingTemplate.body,
        channel: editingTemplate.channel
      }
    });
  };

  const handleSaveNewTemplate = () => {
    // Subject validation for all channels
    if (!newTemplate.subject?.trim()) {
      toast.error('Subject is required');
      return;
    }

    createMutation.mutate(newTemplate);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete);
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
    setNewTemplate({
      name: '',
      channel: 'EMAIL',
      subject: '',
      body: '',
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return <Badge variant="default" className="bg-success text-white">Active</Badge>;
    }
    return <Badge variant="outline" className="">Inactive</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toISOString().split('T')[0];
    } catch {
      return '—';
    }
  };

  const getTypeIcon = (channel: TemplateChannel) => {
    const iconMap = {
      EMAIL: 'message',
      SMS: 'smartphone',
      PUSH: 'notification'
    };

    return iconMap[channel] || 'message';
  };

  const renderLoadingTable = () => (
    <Table className="min-w-full table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px] sm:w-[250px]">Template Name</TableHead>
          <TableHead className="hidden md:table-cell w-[200px]">Detail</TableHead>
          <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
          <TableHead className="hidden lg:table-cell w-[120px]">Last Modified</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array(3).fill(0).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-1/2" /></TableCell>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Notification Templates</h3>
        <p className="text-sm text-gray-600">Manage email, SMS, and push notification templates</p>
      </div>

      <div className="card-body">
        <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(String(newValue) || 'email')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <Tab value="email">Email Templates</Tab>
            <Tab value="sms">SMS Templates</Tab>  
            <Tab value="push">Push Notifications</Tab>
          </TabsList>

          {/* Email Templates Tab */}
          <TabPanel value="email">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Email Templates</h4>
                <Button size="sm" onClick={handleAddTemplate}>
                  <KeenIcon icon="plus" className="me-2" />
                  Add Template
                </Button>
              </div>

              <div className="overflow-x-auto">
                {isEmailLoading ? renderLoadingTable() : (
                  <Table className="min-w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px] sm:w-[250px]">Template Name</TableHead>
                        <TableHead className="hidden md:table-cell w-[200px]">Subject</TableHead>
                        <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
                        <TableHead className="hidden lg:table-cell w-[120px]">Last Modified</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailTemplates.length > 0 ? emailTemplates.map((template) => (
                        <TableRow key={template.template_id}>
                          <TableCell className="w-[200px] sm:w-[250px]">
                            <div className="flex items-center gap-2">
                              <KeenIcon icon={getTypeIcon(template.channel)} className="text-primary text-sm" />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate text-sm">{template.name}</div>
                                <div className="text-xs text-gray-500 hidden sm:block">{template.variables?.length || 0} variables</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell w-[200px]">
                            <div className="max-w-xs">
                              <div className="truncate text-sm" title={template.subject}>
                                {template.subject}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell w-[100px]">{getStatusBadge(template.status)}</TableCell>
                          <TableCell className="hidden lg:table-cell w-[120px]">
                            <div className="text-sm">{formatDate(template.last_modified)}</div>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)} className="flex-shrink-0 p-1">
                                <KeenIcon icon="pencil" className="text-sm" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.template_id)} className="flex-shrink-0 p-1 border-destructive text-destructive hover:bg-destructive hover:text-white">
                                <KeenIcon icon="trash" className="text-sm" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-gray-500">No email templates found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabPanel>

          {/* SMS Templates Tab */}
          <TabPanel value="sms">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">SMS Templates</h4>
                <Button size="sm" onClick={handleAddTemplate}>
                  <KeenIcon icon="plus" className="me-2" />
                  Add Template
                </Button>
              </div>

              <div className="overflow-x-auto">
                {isSmsLoading ? renderLoadingTable() : (
                  <Table className="min-w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px] sm:w-[250px]">Template Name</TableHead>
                        <TableHead className="hidden md:table-cell w-[150px]">Subject</TableHead>
                        {/* <TableHead className="hidden md:table-cell w-[200px]">Content</TableHead> */}
                        <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
                        <TableHead className="hidden lg:table-cell w-[120px]">Last Modified</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {smsTemplates.length > 0 ? smsTemplates.map((template) => (
                        <TableRow key={template.template_id}>
                          <TableCell className="w-[200px] sm:w-[250px]">
                            <div className="flex items-center gap-2">
                              <KeenIcon icon={getTypeIcon(template.channel)} className="text-primary text-sm" />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate text-sm">{template.name}</div>
                                <div className="text-xs text-gray-500 hidden sm:block">{template.variables?.length || 0} variables</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell w-[150px]">
                            <div className="max-w-xs">
                              <div className="truncate text-sm" title={template.subject}>
                                {template.subject || '—'}
                              </div>
                            </div>
                          </TableCell>
                          {/* <TableCell className="hidden md:table-cell w-[200px]">
                            <div className="max-w-xs">
                              <div className="truncate text-sm" title={template.body}>
                                {template.body}
                              </div>
                            </div>
                          </TableCell> */}
                          <TableCell className="hidden sm:table-cell w-[100px]">{getStatusBadge(template.status)}</TableCell>
                          <TableCell className="hidden lg:table-cell w-[120px]">
                            <div className="text-sm">{formatDate(template.last_modified)}</div>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)} className="flex-shrink-0 p-1">
                                <KeenIcon icon="pencil" className="text-sm" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.template_id)} className="flex-shrink-0 p-1 border-destructive text-destructive hover:bg-destructive hover:text-white">
                                <KeenIcon icon="trash" className="text-sm" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                        : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-gray-500">No sms templates found</TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabPanel>

          {/* Push Notifications Tab */}
          <TabPanel value="push">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Push Notification Templates</h4>
                <Button size="sm" onClick={handleAddTemplate}>
                  <KeenIcon icon="plus" className="me-2" />
                  Add Template
                </Button>
              </div>

              <div className="overflow-x-auto">
                {isPushLoading ? renderLoadingTable() : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Subject</TableHead>
                        {/* <TableHead>Content</TableHead> */}
                        <TableHead>Status</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pushTemplates.length > 0 ? pushTemplates.map((template) => (
                        <TableRow key={template.template_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <KeenIcon icon={getTypeIcon(template.channel)} className="text-primary text-sm" />
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-sm text-gray-500">{template.variables?.length || 0} variables</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{template.subject}</TableCell>
                          {/* <TableCell>
                            <div className="max-w-xs">
                              <div className="truncate" title={template.body}>
                                {template.body}
                              </div>
                            </div>
                          </TableCell> */}
                          <TableCell>{getStatusBadge(template.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(template.last_modified)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                                <KeenIcon icon="pencil" className="me-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.template_id)} className="border-destructive text-destructive hover:bg-destructive hover:text-white">
                                <KeenIcon icon="trash" className="me-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-gray-500">No push templates found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </div>

      {/* Template Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="edit" className="text-primary" />
              Edit {editingTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={editingTemplate?.name || ''}
                    onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="template-subject">Subject</Label>
                  <Input
                    id="template-subject"
                    value={editingTemplate?.subject || ''}
                    onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                    className="mt-2"
                    placeholder="Enter template subject..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="template-content">Content</Label>
                <Textarea
                  id="template-content"
                  value={editingTemplate?.body || ''}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, body: e.target.value } : null)}
                  rows={8}
                  className="mt-2"
                  placeholder="Enter template content..."
                />
              </div>

              <div>
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(editingTemplate?.variables || []).map((variable, index) => (
                    <Badge key={index} variant="outline" className="badge-outline">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Quick Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['user_name', 'amount', 'booking_id', 'service_name', 'booking_date', 'booking_time', 'provider_name', 'transaction_id', 'rating_link'].map((variable) => (
                    <Badge
                      key={variable}
                      variant="outline"
                      className="badge-outline cursor-pointer hover:bg-primary hover:text-white"
                      onClick={() => {
                        setEditingTemplate(prev => prev ? {
                          ...prev,
                          body: prev.body + `{{${variable}}}`
                        } : null);
                      }}
                    >
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">Click on variables to add them to your template content</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                  <KeenIcon icon="cross" className="me-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} disabled={updateMutation.isLoading}>
                  {updateMutation.isLoading ? 'Saving...' : (
                    <>
                      <KeenIcon icon="check" className="me-2" />
                      Save Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Template Modal */}
      <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="plus" className="text-primary" />
              Add New Template
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-template-name">Template Name</Label>
                  <Input
                    id="new-template-name"
                    value={newTemplate.name || ''}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-2"
                    placeholder="Enter template name..."
                  />
                </div>

                <div>
                  <Label htmlFor="new-template-type">Template Type</Label>
                  <Select
                    value={newTemplate.channel}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, channel: value as TemplateChannel }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="PUSH">Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="new-template-subject">Subject</Label>
                <Input
                  id="new-template-subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-2"
                  placeholder="Enter template subject..."
                />
              </div>

              <div>
                <Label htmlFor="new-template-content">Content</Label>
                <Textarea
                  id="new-template-content"
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, body: e.target.value }))}
                  rows={8}
                  className="mt-2"
                  placeholder="Enter template content..."
                />
              </div>

              <div>
                <Label>Quick Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['user_name', 'amount', 'booking_id', 'service_name', 'booking_date', 'booking_time', 'provider_name', 'transaction_id', 'rating_link'].map((variable) => (
                    <Badge
                      key={variable}
                      variant="outline"
                      className="badge-outline cursor-pointer hover:bg-primary hover:text-white"
                      onClick={() => {
                        setNewTemplate(prev => ({
                          ...prev,
                          body: prev.body + `{{${variable}}}`
                        }));
                      }}
                    >
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">Click on variables to add them to your template content</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseAddForm}>
                  <KeenIcon icon="cross" className="me-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveNewTemplate} disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? 'Creating...' : (
                    <>
                      <KeenIcon icon="check" className="me-2" />
                      Create Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
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
              onClick={confirmDelete}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { NotificationTemplates };


