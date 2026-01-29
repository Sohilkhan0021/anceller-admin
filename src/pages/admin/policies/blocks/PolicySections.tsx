import { useState, useMemo, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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
import {
  usePolicies,
  usePolicyDetail,
  useUpdatePolicy,
  useCreatePolicy,
  usePublishPolicy
} from '@/services/policy.hooks';
import { PolicyTitleType, IPolicy } from '@/services/policy.types';
import { Skeleton } from '@/components/ui/skeleton';

// interface IPolicySection {
//   id: string;
//   title: string;
//   content: string;
//   lastModified: string;
//   version: string;
//   status: 'draft' | 'published' | 'archived';
//   modifiedBy: string;
// }

const PolicySections = () => {
  const [activeTab, setActiveTab] = useState('TERMS_AND_CONDITIONS');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingContent, setEditingContent] = useState('');
  const [editChanges, setEditChanges] = useState('Update policy content');

  // API Hooks
  const { policies, isLoading: isPoliciesLoading, refetch: refetchPolicies } = usePolicies();

  // Find the policy summary for the active tab to get its ID
  const activePolicySummary = useMemo(() =>
    policies.find(p => p.title === activeTab || p.policy_type === activeTab),
    [policies, activeTab]
  );

  const { policy: activePolicyDetail, isLoading: isDetailLoading } = usePolicyDetail(
    activePolicySummary?.policy_id,
    { enabled: !!activePolicySummary?.policy_id }
  );

  const updatePolicyMutation = useUpdatePolicy({
    onSuccess: () => {
      toast.success('Policy updated successfully');
      setIsEditorOpen(false);
      refetchPolicies();
    },
    onError: (error) => {
      toast.error(`Failed to update policy: ${error.message}`);
    }
  });

  const createPolicyMutation = useCreatePolicy({
    onSuccess: () => {
      toast.success('Policy created successfully');
      setIsEditorOpen(false);
      refetchPolicies();
    },
    onError: (error) => {
      toast.error(`Failed to create policy: ${error.message}`);
    }
  });

  const publishPolicyMutation = usePublishPolicy({
    onSuccess: () => {
      toast.success('Policy published successfully');
      refetchPolicies();
    },
    onError: (error) => {
      toast.error(`Failed to publish policy: ${error.message}`);
    }
  });

  // Mock data - in real app, this would come from API
  /*
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
  */

  /*
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
  */

  const handleEditPolicy = () => {
    setEditingContent(activePolicyDetail?.content || '');
    setEditChanges('');
    setIsEditorOpen(true);
  };

  const handleSavePolicy = () => {
    if (!editingContent.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    if (activePolicySummary?.policy_id) {
      updatePolicyMutation.mutate({
        id: activePolicySummary.policy_id,
        data: {
          title: activeTab as PolicyTitleType,
          content: editingContent,
          changes: editChanges || 'Updated policy content',
          is_published: false // Default to false, user can publish later
        }
      });
    } else {
      createPolicyMutation.mutate({
        policy_type: activeTab,
        title: activeTab as PolicyTitleType,
        content: editingContent
      });
    }
  };

  const handlePublishPolicy = () => {
    if (activePolicySummary?.policy_id) {
      publishPolicyMutation.mutate(activePolicySummary.policy_id);
    }
  };

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return <Badge variant="default" className="bg-success text-white">Published</Badge>;
    }
    return <Badge variant="default" className="bg-warning text-white">Draft</Badge>;
  };

  const formatPolicyTitle = (tabValue: string) => {
    const titleMap: Record<string, string> = {
      'TERMS_AND_CONDITIONS': 'Terms & Conditions',
      'PRIVACY_POLICY': 'Privacy Policy',
      'REFUND_POLICY': 'Refund & Cancellation Policy',
      'CODE_OF_CONDUCT': 'Provider Code of Conduct'
    };
    return titleMap[tabValue] || tabValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderPolicyContent = (title: string, policy: IPolicy | null, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-semibold">{title}</h4>
            <p className="text-sm text-gray-600">
              {policy ? `Last modified: ${new Date(policy.last_modified).toLocaleDateString()}` : 'No policy created yet'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {policy && getStatusBadge(policy.is_published)}
            <Button size="sm" onClick={handleEditPolicy} className="flex-shrink-0 whitespace-nowrap">
              <KeenIcon icon="pencil" className="me-2" />
              {policy ? 'Edit' : 'Create'}
            </Button>
            {policy && !policy.is_published && (
              <Button size="sm" variant="outline" onClick={handlePublishPolicy} className="flex-shrink-0 whitespace-nowrap border-success text-success hover:bg-success hover:text-white" disabled={publishPolicyMutation.isLoading}>
                <KeenIcon icon="check-circle" className="me-2" />
                Publish
              </Button>
            )}
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {policy?.content || 'Click Create to add content for this policy.'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Policy Documents</h3>
        <p className="text-sm text-gray-600">Manage platform policies and legal content</p>
      </div>

      <div className="card-body">
        <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(String(newValue) || 'TERMS_AND_CONDITIONS')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <Tab value="TERMS_AND_CONDITIONS">Terms & Conditions</Tab>
            <Tab value="PRIVACY_POLICY">Privacy Policy</Tab>
            <Tab value="REFUND_POLICY">Refund Policy</Tab>
            <Tab value="CODE_OF_CONDUCT">Code of Conduct</Tab>
          </TabsList>

          <TabPanel value="TERMS_AND_CONDITIONS">
            {renderPolicyContent('Terms & Conditions', activePolicyDetail, isDetailLoading)}
          </TabPanel>

          <TabPanel value="PRIVACY_POLICY">
            {renderPolicyContent('Privacy Policy', activePolicyDetail, isDetailLoading)}
          </TabPanel>

          <TabPanel value="REFUND_POLICY">
            {renderPolicyContent('Refund & Cancellation Policy', activePolicyDetail, isDetailLoading)}
          </TabPanel>

          <TabPanel value="CODE_OF_CONDUCT">
            {renderPolicyContent('Provider Code of Conduct', activePolicyDetail, isDetailLoading)}
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
                {isDetailLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : activePolicyDetail?.version_history && activePolicyDetail.version_history.length > 0 ? (
                  activePolicyDetail.version_history.map((version, index) => (
                    <TableRow key={index}>
                      <TableCell className="w-[80px] sm:w-[100px] font-medium text-sm">{version.version}</TableCell>
                      <TableCell className="hidden sm:table-cell w-[100px] text-sm">{new Date(version.date).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden md:table-cell w-[120px] text-sm" title={version.author}>
                        {version.author.length > 15 ? version.author.substring(0, 15) + '...' : version.author}
                      </TableCell>
                      <TableCell className="w-[200px] sm:w-[250px]">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm" title={version.changes}>
                            {version.changes}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {new Date(version.date).toLocaleDateString()} • {version.author.length > 15 ? version.author.substring(0, 15) + '...' : version.author}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No version history available
                    </TableCell>
                  </TableRow>
                )}
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
              Edit {formatPolicyTitle(activeTab)}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="policy-content">Policy Content</Label>
                <Textarea
                  id="policy-content"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  rows={15}
                  className="mt-2"
                  placeholder="Enter policy content..."
                />
              </div>

              {activePolicySummary?.policy_id && (
                <div>
                  <Label htmlFor="policy-changes">Change Description</Label>
                  <Textarea
                    id="policy-changes"
                    value={editChanges}
                    onChange={(e) => setEditChanges(e.target.value)}
                    rows={2}
                    className="mt-2"
                    placeholder="Describe what changed in this version..."
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditorOpen(false)} className="flex-shrink-0">
                  <KeenIcon icon="cross" className="me-2" />
                  Cancel
                </Button>
                <Button onClick={handleSavePolicy} disabled={updatePolicyMutation.isLoading || createPolicyMutation.isLoading} className="flex-shrink-0">
                  {updatePolicyMutation.isLoading || createPolicyMutation.isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="check" className="me-2" />
                      Save Changes
                    </>
                  )}
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


