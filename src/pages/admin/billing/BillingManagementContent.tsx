import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, Tab, TabsList, TabPanel } from '@/components/tabs';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { toast } from 'sonner';
import {
  useCommissionTiers,
  useCreateCommissionTier,
  useUpdateCommissionTier,
  useDeleteCommissionTier,
  useAdminProviderPackages,
  useCreateProviderPackage,
  useUpdateProviderPackage,
  useDeleteProviderPackage
} from '@/services/billingModels.hooks';
import type { ICommissionTier, IProviderPackage } from '@/services/billingModels.service';
import { formatAmount } from '@/utils/currency';

const emptyTierForm = () => ({
  tier_name: '',
  tier_level: '',
  commission_rate: '',
  minimum_wallet: '0',
  min_rating: '',
  min_jobs_completed: '',
  priority_allocation: false,
  description: '',
  is_active: true,
  is_default: false
});

const emptyPackageForm = () => ({
  package_name: '',
  monthly_fee: '',
  lead_quota: '',
  validity_days: '30',
  carry_forward_percentage: '50',
  description: '',
  is_active: true
});

const BillingManagementContent = () => {
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierForm, setTierForm] = useState(emptyTierForm);

  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState(emptyPackageForm);

  const { data: tiers, isLoading, isError, error } = useCommissionTiers();
  const createTierMutation = useCreateCommissionTier();
  const updateTierMutation = useUpdateCommissionTier();
  const deleteTierMutation = useDeleteCommissionTier();

  const {
    data: packagesData,
    isLoading: isLoadingPackages,
    isError: isErrorPackages,
    error: packagesError
  } = useAdminProviderPackages({ page: 1, limit: 100 });
  const createPackageMutation = useCreateProviderPackage();
  const updatePackageMutation = useUpdateProviderPackage();
  const deletePackageMutation = useDeleteProviderPackage();

  const startEditTier = (tier: ICommissionTier) => {
    setEditingTierId(tier.tier_id);
    setTierForm({
      tier_name: tier.tier_name,
      tier_level: String(tier.tier_level),
      commission_rate: String(tier.commission_rate ?? ''),
      minimum_wallet: String(tier.minimum_wallet ?? 0),
      min_rating:
        tier.min_rating != null && tier.min_rating !== undefined ? String(tier.min_rating) : '',
      min_jobs_completed:
        tier.min_jobs_completed != null && tier.min_jobs_completed !== undefined
          ? String(tier.min_jobs_completed)
          : '',
      priority_allocation: !!tier.priority_allocation,
      description: tier.description || '',
      is_active: !!tier.is_active,
      is_default: !!tier.is_default
    });
  };

  const resetTierForm = () => {
    setEditingTierId(null);
    setTierForm(emptyTierForm());
  };

  const handleSaveTier = async () => {
    const payload = {
      tier_name: tierForm.tier_name,
      tier_level: Number(tierForm.tier_level),
      commission_rate: Number(tierForm.commission_rate),
      minimum_wallet: Math.max(0, Number(tierForm.minimum_wallet) || 0),
      min_rating: tierForm.min_rating.trim() === '' ? null : Number(tierForm.min_rating),
      min_jobs_completed:
        tierForm.min_jobs_completed && tierForm.min_jobs_completed.trim() !== ''
          ? Math.max(0, Number(tierForm.min_jobs_completed) || 0)
          : undefined,
      priority_allocation: tierForm.priority_allocation,
      description: tierForm.description || undefined,
      is_active: tierForm.is_active,
      is_default: tierForm.is_default
    };

    try {
      if (editingTierId) {
        await updateTierMutation.mutateAsync({ tierId: editingTierId, data: payload });
        toast.success('Commission tier updated');
      } else {
        await createTierMutation.mutateAsync(payload);
        toast.success('Commission tier created');
      }
      resetTierForm();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save commission tier';
      toast.error(msg);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!window.confirm('Are you sure you want to delete this tier?')) return;
    try {
      await deleteTierMutation.mutateAsync(tierId);
      toast.success('Commission tier deleted');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete commission tier';
      toast.error(msg);
    }
  };

  const startEditPackage = (p: IProviderPackage) => {
    setEditingPackageId(p.package_id);
    setPackageForm({
      package_name: p.package_name,
      monthly_fee: String(p.monthly_fee ?? ''),
      lead_quota: String(p.lead_quota ?? ''),
      validity_days: String(p.validity_days ?? 30),
      carry_forward_percentage: String(p.carry_forward_percentage ?? 50),
      description: p.description || '',
      is_active: !!p.is_active
    });
  };

  const resetPackageForm = () => {
    setEditingPackageId(null);
    setPackageForm(emptyPackageForm());
  };

  const handleSavePackage = async () => {
    const payload = {
      package_name: packageForm.package_name,
      monthly_fee: Number(packageForm.monthly_fee),
      lead_quota: Number(packageForm.lead_quota),
      validity_days: Math.max(1, Math.min(365, Number(packageForm.validity_days) || 30)),
      carry_forward_percentage: Math.min(
        100,
        Math.max(0, Number(packageForm.carry_forward_percentage) || 0)
      ),
      description: packageForm.description || undefined,
      is_active: packageForm.is_active
    };

    try {
      if (editingPackageId) {
        await updatePackageMutation.mutateAsync({ packageId: editingPackageId, data: payload });
        toast.success('Package updated');
      } else {
        await createPackageMutation.mutateAsync(payload);
        toast.success('Package created');
      }
      resetPackageForm();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save package';
      toast.error(msg);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!window.confirm('Deactivate this package? (Cannot delete if active subscriptions exist.)'))
      return;
    try {
      await deletePackageMutation.mutateAsync(packageId);
      toast.success('Package deactivated');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete package';
      toast.error(msg);
    }
  };

  const packages = packagesData?.packages ?? [];

  return (
    <div className="space-y-6 px-4 pt-4 md:px-6 md:pt-6">
      <div className="max-w-3xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing Models</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Configure commission tiers (per-job %, wallet minimums, eligibility hints) and MG /
          subscription packages (fee, lead quota, plan validity in days, carry-forward %). Changes
          apply to new provider selections and renewals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="commission" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-2">
              <Tab value="commission">Commission models</Tab>
              <Tab value="packages">Packages (MG / leads)</Tab>
            </TabsList>

            <TabPanel value="commission" className="space-y-4 pt-6">
              {isError && (
                <Alert variant="danger">
                  {(error as Error)?.message || 'Failed to load tiers'}
                </Alert>
              )}
              {isLoading ? (
                <ContentLoader />
              ) : (
                <>
                  <div className="overflow-x-auto border rounded mb-4">
                    <table className="min-w-full text-sm">
                      <thead className="bg-surface-1">
                        <tr>
                          <th className="px-3 py-2 text-left">Tier</th>
                          <th className="px-3 py-2 text-left">Level</th>
                          <th className="px-3 py-2 text-left">Commission %</th>
                          <th className="px-3 py-2 text-left">Min rating</th>
                          <th className="px-3 py-2 text-left">Min jobs</th>
                          <th className="px-3 py-2 text-left">Priority</th>
                          <th className="px-3 py-2 text-left">Default</th>
                          <th className="px-3 py-2 text-left">Active</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(tiers || []).map((t) => (
                          <tr key={t.tier_id} className="border-t">
                            <td className="px-3 py-2 font-medium">{t.tier_name}</td>
                            <td className="px-3 py-2">{t.tier_level}</td>
                            <td className="px-3 py-2">{String(t.commission_rate)}%</td>
                            <td className="px-3 py-2">
                              {t.min_rating != null ? `${t.min_rating}` : '—'}
                            </td>
                            <td className="px-3 py-2">
                              {t.min_jobs_completed != null ? t.min_jobs_completed : 0}
                            </td>
                            <td className="px-3 py-2">{t.priority_allocation ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-2">{t.is_default ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-2">{t.is_active ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                              <Button variant="outline" size="sm" onClick={() => startEditTier(t)}>
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-danger border-danger/40"
                                onClick={() => handleDeleteTier(t.tier_id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {(tiers || []).length === 0 && (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={9}>
                              No commission tiers found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3 bg-surface-1/50">
                    <h3 className="text-sm font-semibold">
                      {editingTierId ? 'Edit commission tier' : 'Create commission tier'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Tier name</Label>
                        <input
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          value={tierForm.tier_name}
                          onChange={(e) => setTierForm({ ...tierForm, tier_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Tier level (sort order)</Label>
                        <input
                          type="number"
                          min={1}
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          value={tierForm.tier_level}
                          onChange={(e) => setTierForm({ ...tierForm, tier_level: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Commission % (per job)</Label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          value={tierForm.commission_rate}
                          onChange={(e) =>
                            setTierForm({ ...tierForm, commission_rate: e.target.value })
                          }
                        />
                      </div>
                      {/* <div>
                        <Label>Minimum wallet (₹)</Label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          value={tierForm.minimum_wallet}
                          onChange={(e) => setTierForm({ ...tierForm, minimum_wallet: e.target.value })}
                        />
                      </div> */}
                      <div>
                        <Label>Minimum partner rating (optional)</Label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          step={0.01}
                          placeholder="e.g. 4.5 for Silver"
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          value={tierForm.min_rating}
                          onChange={(e) => setTierForm({ ...tierForm, min_rating: e.target.value })}
                        />
                        {/* <p className="text-xs text-gray-500 mt-1">Leave empty if not used.</p> */}
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2">
                        <input
                          id="tier-priority"
                          type="checkbox"
                          checked={tierForm.priority_allocation}
                          onChange={(e) =>
                            setTierForm({ ...tierForm, priority_allocation: e.target.checked })
                          }
                        />
                        <Label htmlFor="tier-priority" className="text-sm text-muted-foreground">
                          Priority allocation (e.g. Gold — prefer in dispatch when applicable)
                        </Label>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <textarea
                          className="border rounded px-3 py-2 text-sm w-full min-h-[80px] bg-white"
                          value={tierForm.description}
                          onChange={(e) =>
                            setTierForm({ ...tierForm, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="tier-active"
                          type="checkbox"
                          checked={tierForm.is_active}
                          onChange={(e) =>
                            setTierForm({ ...tierForm, is_active: e.target.checked })
                          }
                        />
                        <Label htmlFor="tier-active" className="text-sm text-muted-foreground">
                          Active
                        </Label>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSaveTier}
                        disabled={createTierMutation.isLoading || updateTierMutation.isLoading}
                      >
                        {editingTierId ? 'Update tier' : 'Create tier'}
                      </Button>
                      {editingTierId && (
                        <Button variant="outline" onClick={resetTierForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabPanel>

            <TabPanel value="packages" className="space-y-4 pt-6">
              {isErrorPackages && (
                <Alert variant="danger">
                  {(packagesError as Error)?.message || 'Failed to load packages'}
                </Alert>
              )}
              {isLoadingPackages ? (
                <ContentLoader />
              ) : (
                <>
                  <div className="overflow-x-auto border rounded mb-4">
                    <table className="min-w-full text-sm">
                      <thead className="bg-surface-1">
                        <tr>
                          <th className="px-3 py-2 text-left">Package</th>
                          <th className="px-3 py-2 text-left">Fee (₹)</th>
                          <th className="px-3 py-2 text-left">Lead quota</th>
                          <th className="px-3 py-2 text-left">Validity (days)</th>
                          <th className="px-3 py-2 text-left">Carry %</th>
                          <th className="px-3 py-2 text-left">Active subs</th>
                          <th className="px-3 py-2 text-left">Active</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packages.map((p) => (
                          <tr key={p.package_id} className="border-t">
                            <td className="px-3 py-2 font-medium">{p.package_name}</td>
                            <td className="px-3 py-2">{formatAmount(p.monthly_fee)}</td>
                            <td className="px-3 py-2">{p.lead_quota}</td>
                            <td className="px-3 py-2">{p.validity_days ?? 30}</td>
                            <td className="px-3 py-2">{String(p.carry_forward_percentage)}%</td>
                            <td className="px-3 py-2">{p.active_subscriptions_count ?? 0}</td>
                            <td className="px-3 py-2">{p.is_active ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditPackage(p)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-danger border-danger/40"
                                onClick={() => handleDeletePackage(p.package_id)}
                              >
                                Deactivate
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {packages.length === 0 && (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={8}>
                              No packages found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3 bg-surface-1/50">
                    <h3 className="text-sm font-semibold">
                      {editingPackageId ? 'Edit package' : 'Create package'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Label>Package name</Label>
                        <input
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          placeholder="e.g. MG Plan-30"
                          value={packageForm.package_name}
                          onChange={(e) =>
                            setPackageForm({ ...packageForm, package_name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Fee (₹)</Label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          value={packageForm.monthly_fee}
                          onChange={(e) =>
                            setPackageForm({ ...packageForm, monthly_fee: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Lead quota</Label>
                        <input
                          type="number"
                          min={1}
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          value={packageForm.lead_quota}
                          onChange={(e) =>
                            setPackageForm({ ...packageForm, lead_quota: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Validity (days)</Label>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          value={packageForm.validity_days}
                          onChange={(e) =>
                            setPackageForm({ ...packageForm, validity_days: e.target.value })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          e.g. 30 or 15 for MG windows.
                        </p>
                      </div>
                      <div>
                        <Label>Carry-forward % (unused leads)</Label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          className="border rounded px-3 py-2 text-sm w-full bg-white"
                          value={packageForm.carry_forward_percentage}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              carry_forward_percentage: e.target.value
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <textarea
                          className="border rounded px-3 py-2 text-sm w-full min-h-[72px] bg-white"
                          value={packageForm.description}
                          onChange={(e) =>
                            setPackageForm({ ...packageForm, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="pkg-active"
                          type="checkbox"
                          checked={packageForm.is_active}
                          onChange={(e) =>
                            setPackageForm({ ...packageForm, is_active: e.target.checked })
                          }
                        />
                        <Label htmlFor="pkg-active" className="text-sm text-muted-foreground">
                          Active
                        </Label>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSavePackage}
                        disabled={
                          createPackageMutation.isLoading || updatePackageMutation.isLoading
                        }
                      >
                        {editingPackageId ? 'Update package' : 'Create package'}
                      </Button>
                      {editingPackageId && (
                        <Button variant="outline" onClick={resetPackageForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabPanel>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingManagementContent;
