import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface IPolicySection {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  modifiedBy: string;
}

const PolicySections = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<IPolicySection | null>(null);

  // Mock data - in real app, this would come from API
  const policies: IPolicySection[] = [
    {
      id: 'terms',
      title: 'Terms & Conditions',
      content: 'By using our service, you agree to these terms and conditions...',
      lastModified: '2024-01-20',
      version: '2.1',
      status: 'published',
      modifiedBy: 'Admin User'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: 'We respect your privacy and are committed to protecting your personal data...',
      lastModified: '2024-01-18',
      version: '1.8',
      status: 'published',
      modifiedBy: 'Admin User'
    },
    {
      id: 'refund',
      title: 'Refund & Cancellation Policy',
      content: 'Our refund policy ensures customer satisfaction while maintaining service quality...',
      lastModified: '2024-01-15',
      version: '1.5',
      status: 'draft',
      modifiedBy: 'Admin User'
    },
    {
      id: 'conduct',
      title: 'Provider Code of Conduct',
      content: 'All service providers must adhere to our code of conduct to ensure quality service...',
      lastModified: '2024-01-10',
      version: '3.0',
      status: 'published',
      modifiedBy: 'Admin User'
    }
  ];

  const versionHistory = [
    {
      version: '2.1',
      date: '2024-01-20',
      author: 'Admin User',
      changes: 'Updated payment terms and service conditions'
    },
    {
      version: '2.0',
      date: '2024-01-15',
      author: 'Admin User',
      changes: 'Major revision of terms and conditions'
    },
    {
      version: '1.9',
      date: '2024-01-10',
      author: 'Admin User',
      changes: 'Added new clauses for data protection'
    }
  ];

  const handleEditPolicy = (policy: IPolicySection) => {
    setEditingPolicy(policy);
    setIsEditorOpen(true);
  };

  const handleSavePolicy = () => {
    // TODO: Implement save policy functionality
    console.log('Saving policy:', editingPolicy);
    setIsEditorOpen(false);
    setEditingPolicy(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { variant: 'default', className: 'bg-success text-white', text: 'Published' },
      draft: { variant: 'default', className: 'bg-warning text-white', text: 'Draft' },
      archived: { variant: 'secondary', className: '', text: 'Archived' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const currentPolicy = policies.find(p => p.id === activeTab);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Policy Documents</h3>
        <p className="text-sm text-gray-600">Manage platform policies and legal content</p>
      </div>
      
      <div className="card-body">
        <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(String(newValue) || 'terms')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <Tab value="terms">Terms & Conditions</Tab>
            <Tab value="privacy">Privacy Policy</Tab>
            <Tab value="refund">Refund Policy</Tab>
            <Tab value="conduct">Code of Conduct</Tab>
          </TabsList>

          {/* Terms & Conditions Tab */}
          <TabPanel value="terms">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">Terms & Conditions</h4>
                  <p className="text-sm text-gray-600">Last modified: {currentPolicy?.lastModified}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(currentPolicy?.status || 'draft')}
                  <Button size="sm" onClick={() => handleEditPolicy(currentPolicy!)} className="w-full sm:w-auto">
                    <KeenIcon icon="pencil" className="me-2" />
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {currentPolicy?.content}
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Privacy Policy Tab */}
          <TabPanel value="privacy">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">Privacy Policy</h4>
                  <p className="text-sm text-gray-600">Last modified: {currentPolicy?.lastModified}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(currentPolicy?.status || 'draft')}
                  <Button size="sm" onClick={() => handleEditPolicy(currentPolicy!)}>
                    <KeenIcon icon="pencil" className="me-2" />
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {currentPolicy?.content}
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Refund Policy Tab */}
          <TabPanel value="refund">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">Refund & Cancellation Policy</h4>
                  <p className="text-sm text-gray-600">Last modified: {currentPolicy?.lastModified}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(currentPolicy?.status || 'draft')}
                  <Button size="sm" onClick={() => handleEditPolicy(currentPolicy!)}>
                    <KeenIcon icon="pencil" className="me-2" />
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {currentPolicy?.content}
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Code of Conduct Tab */}
          <TabPanel value="conduct">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">Provider Code of Conduct</h4>
                  <p className="text-sm text-gray-600">Last modified: {currentPolicy?.lastModified}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(currentPolicy?.status || 'draft')}
                  <Button size="sm" onClick={() => handleEditPolicy(currentPolicy!)}>
                    <KeenIcon icon="pencil" className="me-2" />
                    Edit
                  </Button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {currentPolicy?.content}
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>
        </Tabs>

        {/* Version History */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4">Version History</h4>
          <div className="overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] sm:w-[100px]">Version</TableHead>
                  <TableHead className="hidden sm:table-cell w-[100px]">Date</TableHead>
                  <TableHead className="hidden md:table-cell w-[120px]">Author</TableHead>
                  <TableHead className="w-[200px] sm:w-[250px]">Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versionHistory.map((version, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[80px] sm:w-[100px] font-medium text-sm">{version.version}</TableCell>
                    <TableCell className="hidden sm:table-cell w-[100px] text-sm">{version.date}</TableCell>
                    <TableCell className="hidden md:table-cell w-[120px] text-sm">{version.author}</TableCell>
                    <TableCell className="w-[200px] sm:w-[250px]">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm" title={version.changes}>
                          {version.changes}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">{version.date} • {version.author}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Policy Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="edit" className="text-primary" />
              Edit {editingPolicy?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            <div className="space-y-6">
            <div>
              <Label htmlFor="policy-content">Policy Content</Label>
              <Textarea
                id="policy-content"
                value={editingPolicy?.content || ''}
                onChange={(e) => setEditingPolicy(prev => prev ? {...prev, content: e.target.value} : null)}
                rows={15}
                className="mt-2"
                placeholder="Enter policy content..."
              />
            </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                  <KeenIcon icon="cross" className="me-2" />
                  Cancel
                </Button>
                <Button onClick={handleSavePolicy}>
                  <KeenIcon icon="check" className="me-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { PolicySections };


