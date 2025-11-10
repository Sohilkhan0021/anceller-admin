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
  Tabs,
  TabPanel,
  TabsList,
  Tab,
} from '@/components/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface INotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject: string;
  content: string;
  variables: string[];
  status: 'active' | 'inactive' | 'draft';
  lastModified: string;
  modifiedBy: string;
}

const NotificationTemplates = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<INotificationTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<INotificationTemplate>>({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    variables: [],
    status: 'draft'
  });

  // Mock data - in real app, this would come from API
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

  const handleEditTemplate = (template: INotificationTemplate) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleAddTemplate = () => {
    setNewTemplate({
      name: '',
      type: activeTab as 'email' | 'sms' | 'push',
      subject: '',
      content: '',
      variables: [],
      status: 'draft'
    });
    setIsAddFormOpen(true);
  };

  const handleSaveTemplate = () => {
    // TODO: Implement save template functionality
    console.log('Saving template:', editingTemplate);
    setIsEditorOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveNewTemplate = () => {
    // TODO: Implement save new template functionality
    console.log('Saving new template:', newTemplate);
    setIsAddFormOpen(false);
    setNewTemplate({
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: [],
      status: 'draft'
    });
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
    setNewTemplate({
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: [],
      status: 'draft'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default', className: 'bg-success text-white', text: 'Active' },
      inactive: { variant: 'destructive', className: '', text: 'Inactive' },
      draft: { variant: 'default', className: 'bg-warning text-white', text: 'Draft' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      email: 'message',
      sms: 'smartphone',
      push: 'notification'
    };
    
    return iconMap[type as keyof typeof iconMap] || 'message';
  };

  const getCurrentTemplates = () => {
    switch (activeTab) {
      case 'email': return emailTemplates;
      case 'sms': return smsTemplates;
      case 'push': return pushTemplates;
      default: return emailTemplates;
    }
  };

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
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] sm:w-[250px]">Template Name</TableHead>
                      <TableHead className="hidden md:table-cell w-[200px]">Subject</TableHead>
                      <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
                      <TableHead className="hidden lg:table-cell w-[120px]">Last Modified</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="w-[200px] sm:w-[250px]">
                          <div className="flex items-center gap-2">
                            <KeenIcon icon={getTypeIcon(template.type)} className="text-primary text-sm" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate text-sm">{template.name}</div>
                              <div className="text-xs text-gray-500 hidden sm:block">{template.variables.length} variables</div>
                              <div className="text-xs text-gray-500 sm:hidden">{template.subject.substring(0, 20)}...</div>
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
                          <div className="text-sm">{template.lastModified}</div>
                        </TableCell>
                        <TableCell className="w-[80px]">
                          <div className="flex items-center justify-end">
                            <div className="flex flex-col gap-1 sm:hidden mr-1">
                              <div className="sm:hidden">
                                {getStatusBadge(template.status)}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)} className="flex-shrink-0 p-1">
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
                <Table className="min-w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] sm:w-[250px]">Template Name</TableHead>
                      <TableHead className="hidden md:table-cell w-[200px]">Content</TableHead>
                      <TableHead className="hidden sm:table-cell w-[100px]">Status</TableHead>
                      <TableHead className="hidden lg:table-cell w-[120px]">Last Modified</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {smsTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="w-[200px] sm:w-[250px]">
                          <div className="flex items-center gap-2">
                            <KeenIcon icon={getTypeIcon(template.type)} className="text-primary text-sm" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate text-sm">{template.name}</div>
                              <div className="text-xs text-gray-500 hidden sm:block">{template.variables.length} variables</div>
                              <div className="text-xs text-gray-500 sm:hidden">{template.content.substring(0, 20)}...</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell w-[200px]">
                          <div className="max-w-xs">
                            <div className="truncate text-sm" title={template.content}>
                              {template.content}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell w-[100px]">{getStatusBadge(template.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell w-[120px]">
                          <div className="text-sm">{template.lastModified}</div>
                        </TableCell>
                        <TableCell className="w-[80px]">
                          <div className="flex items-center justify-end">
                            <div className="flex flex-col gap-1 sm:hidden mr-1">
                              <div className="sm:hidden">
                                {getStatusBadge(template.status)}
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)} className="flex-shrink-0 p-1">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pushTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <KeenIcon icon={getTypeIcon(template.type)} className="text-primary text-sm" />
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-gray-500">{template.variables.length} variables</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{template.subject}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="truncate" title={template.content}>
                              {template.content}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(template.status)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                            <KeenIcon icon="pencil" className="me-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  onChange={(e) => setEditingTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="mt-2"
                />
              </div>
              
              {editingTemplate?.type === 'email' && (
                <div>
                  <Label htmlFor="template-subject">Subject</Label>
                  <Input
                    id="template-subject"
                    value={editingTemplate?.subject || ''}
                    onChange={(e) => setEditingTemplate(prev => prev ? {...prev, subject: e.target.value} : null)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="template-content">Content</Label>
              <Textarea
                id="template-content"
                value={editingTemplate?.content || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, content: e.target.value} : null)}
                rows={8}
                className="mt-2"
                placeholder="Enter template content..."
              />
            </div>

            <div>
              <Label>Available Variables</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {editingTemplate?.variables.map((variable, index) => (
                  <Badge key={index} variant="outline" className="badge-outline">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                  <KeenIcon icon="cross" className="me-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <KeenIcon icon="check" className="me-2" />
                  Save Template
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
                    onChange={(e) => setNewTemplate(prev => ({...prev, name: e.target.value}))}
                    className="mt-2"
                    placeholder="Enter template name..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-template-type">Template Type</Label>
                  <Select
                    value={newTemplate.type || 'email'}
                    onValueChange={(value) => setNewTemplate(prev => ({...prev, type: value as 'email' | 'sms' | 'push'}))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newTemplate.type === 'email' && (
                <div>
                  <Label htmlFor="new-template-subject">Subject</Label>
                  <Input
                    id="new-template-subject"
                    value={newTemplate.subject || ''}
                    onChange={(e) => setNewTemplate(prev => ({...prev, subject: e.target.value}))}
                    className="mt-2"
                    placeholder="Enter email subject..."
                  />
                </div>
              )}

              <div>
                <Label htmlFor="new-template-content">Content</Label>
                <Textarea
                  id="new-template-content"
                  value={newTemplate.content || ''}
                  onChange={(e) => setNewTemplate(prev => ({...prev, content: e.target.value}))}
                  rows={8}
                  className="mt-2"
                  placeholder="Enter template content..."
                />
              </div>

              <div>
                <Label>Template Status</Label>
                <Select
                  value={newTemplate.status || 'draft'}
                  onValueChange={(value) => setNewTemplate(prev => ({...prev, status: value as 'active' | 'inactive' | 'draft'}))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['customer_name', 'service_name', 'booking_date', 'booking_time', 'provider_name', 'amount', 'transaction_id'].map((variable) => (
                    <Badge 
                      key={variable} 
                      variant="outline" 
                      className="badge-outline cursor-pointer hover:bg-primary hover:text-white"
                      onClick={() => {
                        const currentVariables = newTemplate.variables || [];
                        if (currentVariables.includes(variable)) {
                          setNewTemplate(prev => ({
                            ...prev,
                            variables: currentVariables.filter(v => v !== variable)
                          }));
                        } else {
                          setNewTemplate(prev => ({
                            ...prev,
                            variables: [...currentVariables, variable]
                          }));
                        }
                      }}
                    >
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">Click on variables to add them to your template</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseAddForm}>
                  <KeenIcon icon="cross" className="me-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveNewTemplate}>
                  <KeenIcon icon="check" className="me-2" />
                  Create Template
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { NotificationTemplates };


