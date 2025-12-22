import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  SelectValue
} from '@/components/ui/select';

interface ICreateTicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketData: any) => void;
}

const CreateTicketForm = ({ isOpen, onClose, onSave }: ICreateTicketFormProps) => {
  const [formData, setFormData] = useState({
    userId: '',
    userEmail: '',
    userName: '',
    issue: '',
    description: '',
    priority: 'medium',
    category: 'general',
    assignedTo: '',
    status: 'open'
  });

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'technical', label: 'Technical' },
    { value: 'billing', label: 'Billing' },
    { value: 'account', label: 'Account' },
    { value: 'service', label: 'Service' }
  ];

  const assignedToOptions = [
    { value: 'support-team', label: 'Support Team' },
    { value: 'tech-team', label: 'Tech Team' },
    { value: 'finance-team', label: 'Finance Team' },
    { value: 'operations-team', label: 'Operations Team' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      id: `TKT_${Date.now()}`,
      ticketId: `T-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    onClose();
    // Reset form
    setFormData({
      userId: '',
      userEmail: '',
      userName: '',
      issue: '',
      description: '',
      priority: 'medium',
      category: 'general',
      assignedTo: '',
      status: 'open'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="message" className="text-primary" />
            Create New Support Ticket
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  className="mt-2"
                  placeholder="Enter user ID (optional)"
                />
              </div>
              
              <div>
                <Label htmlFor="userEmail">User Email *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => handleInputChange('userEmail', e.target.value)}
                  required
                  className="mt-2"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="userName">User Name *</Label>
              <Input
                id="userName"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                required
                className="mt-2"
                placeholder="Enter user's full name"
              />
            </div>
          </div>

          {/* Ticket Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ticket Information</h3>
            
            <div>
              <Label htmlFor="issue">Issue Title *</Label>
              <Input
                id="issue"
                value={formData.issue}
                onChange={(e) => handleInputChange('issue', e.target.value)}
                required
                className="mt-2"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                rows={4}
                className="mt-2"
                placeholder="Detailed description of the issue..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Assignment</h3>
            
            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {assignedToOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <KeenIcon icon="check" className="me-2" />
              Create Ticket
            </Button>
          </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { CreateTicketForm };
