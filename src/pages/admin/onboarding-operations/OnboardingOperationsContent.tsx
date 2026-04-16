import { useState } from 'react';
import { useQuery } from 'react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  getProviderPackages,
  useCommissionTiers,
  useCreateProviderOnboardingPayment,
  useMarkProviderOnboardingPaymentPaid,
  useProviderBillingModel,
  useProviderOnboarding,
  useProviderOnboardingPayments,
  useUpdateOnboardingPayment,
  useUpdateProviderBillingModel
} from '@/services';
import { formatAmount } from '@/utils/currency';
import { toast } from 'sonner';

const OnboardingOperationsContent = () => {
  const [providerInput, setProviderInput] = useState('');
  const [providerId, setProviderId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string>('');

  const [registrationAmount, setRegistrationAmount] = useState('');
  const [trainingAmount, setTrainingAmount] = useState('');
  const [kitAmount, setKitAmount] = useState('');

  const [feeType, setFeeType] = useState<'REGISTRATION' | 'TRAINING' | 'KIT'>('REGISTRATION');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [txnRef, setTxnRef] = useState('');
  const [remarks, setRemarks] = useState('');

  const { onboarding } = useProviderOnboarding(providerId, { enabled: !!providerId });
  const { data: billingData } = useProviderBillingModel(providerId, { enabled: !!providerId });
  const { data: commissionTiers } = useCommissionTiers();
  const { data: packagesData } = useQuery(['provider-packages-for-assignment'], () =>
    getProviderPackages({ is_active: true, page: 1, limit: 100 })
  );
  const { data: paymentsData } = useProviderOnboardingPayments(
    providerId,
    { page: 1, limit: 20 },
    { enabled: !!providerId }
  );

  const updateOnboardingMutation = useUpdateOnboardingPayment({
    onSuccess: () => toast.success('Onboarding updated'),
    onError: (error) => toast.error(error.message || 'Failed to update onboarding')
  });
  const createPaymentMutation = useCreateProviderOnboardingPayment({
    onSuccess: () => toast.success('Onboarding payment entry created'),
    onError: (error) => toast.error(error.message || 'Failed to create payment entry')
  });
  const markPaidMutation = useMarkProviderOnboardingPaymentPaid({
    onSuccess: () => toast.success('Payment marked as paid'),
    onError: (error) => toast.error(error.message || 'Failed to mark payment as paid')
  });
  const updateBillingMutation = useUpdateProviderBillingModel({
    onSuccess: () => toast.success('Plan assigned successfully'),
    onError: (error) => toast.error(error.message || 'Failed to assign plan')
  });

  const selectedProviderId = providerId || '';
  const planOptions = [
    ...((commissionTiers || [])
      .filter((tier: any) => tier.is_active)
      .map((tier: any) => ({
        value: tier.public_id,
        label: `${tier.tier_name} (Commission) - ${tier.public_id}`
      })) || []),
    ...((packagesData?.packages || [])
      .filter((pkg: any) => pkg.is_active)
      .map((pkg: any) => ({
        value: pkg.public_id,
        label: `${pkg.package_name} (Package) - ${pkg.public_id}`
      })) || [])
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Provider Onboarding Operations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage onboarding amounts, payment statuses, payment ledger, and billing plan assignment
          from one screen.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Enter provider_id or public_id"
              value={providerInput}
              onChange={(e) => setProviderInput(e.target.value)}
            />
            <Button
              onClick={() => setProviderId(providerInput.trim() || null)}
              disabled={!providerInput.trim()}
            >
              Load
            </Button>
          </div>
        </CardContent>
      </Card>

      {!!providerId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Amount & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Registration amount</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={registrationAmount}
                    onChange={(e) => setRegistrationAmount(e.target.value)}
                    placeholder={String(onboarding?.checklist?.registration_fee?.amount ?? '')}
                  />
                </div>
                <div>
                  <Label>Training amount</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={trainingAmount}
                    onChange={(e) => setTrainingAmount(e.target.value)}
                    placeholder={String((onboarding as any)?.checklist?.training?.fee_amount ?? '')}
                  />
                </div>
                <div>
                  <Label>Kit amount</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={kitAmount}
                    onChange={(e) => setKitAmount(e.target.value)}
                    placeholder={String((onboarding as any)?.checklist?.kit?.fee_amount ?? '')}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={updateOnboardingMutation.isLoading}
                  onClick={() =>
                    updateOnboardingMutation.mutate({
                      providerId: selectedProviderId,
                      data: {
                        ...(registrationAmount
                          ? { registration_fee_amount: Number(registrationAmount) }
                          : {}),
                        ...(trainingAmount ? { training_fee_amount: Number(trainingAmount) } : {}),
                        ...(kitAmount ? { kit_fee_amount: Number(kitAmount) } : {})
                      }
                    })
                  }
                >
                  Save Amounts
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    updateOnboardingMutation.mutate({
                      providerId: selectedProviderId,
                      data: { registration_fee_paid: true }
                    })
                  }
                >
                  Mark Registration Paid
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    updateOnboardingMutation.mutate({
                      providerId: selectedProviderId,
                      data: { training_fee_paid: true }
                    })
                  }
                >
                  Mark Training Paid
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    updateOnboardingMutation.mutate({
                      providerId: selectedProviderId,
                      data: { kit_fee_paid: true }
                    })
                  }
                >
                  Mark Kit Paid
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Onboarding Payment Ledger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <select
                  className="border rounded px-3 py-2 text-sm"
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value as any)}
                >
                  <option value="REGISTRATION">REGISTRATION</option>
                  <option value="TRAINING">TRAINING</option>
                  <option value="KIT">KIT</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="border rounded px-3 py-2 text-sm"
                  placeholder="Amount (optional)"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                <input
                  type="text"
                  className="border rounded px-3 py-2 text-sm"
                  placeholder="Method (upi/netbanking/wallet/cash_on_delivery)"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <input
                  type="text"
                  className="border rounded px-3 py-2 text-sm"
                  placeholder="Transaction reference"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                />
                <input
                  type="text"
                  className="border rounded px-3 py-2 text-sm"
                  placeholder="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    createPaymentMutation.mutate({
                      providerId: selectedProviderId,
                      data: {
                        fee_type: feeType,
                        amount: paymentAmount ? Number(paymentAmount) : undefined,
                        mark_as_paid: false,
                        payment_method: paymentMethod,
                        transaction_reference: txnRef || undefined,
                        remarks: remarks || undefined
                      }
                    })
                  }
                >
                  Create Pending
                </Button>
                <Button
                  onClick={() =>
                    createPaymentMutation.mutate({
                      providerId: selectedProviderId,
                      data: {
                        fee_type: feeType,
                        amount: paymentAmount ? Number(paymentAmount) : undefined,
                        mark_as_paid: true,
                        payment_method: paymentMethod,
                        transaction_reference: txnRef || undefined,
                        remarks: remarks || undefined
                      }
                    })
                  }
                >
                  Create + Mark Paid
                </Button>
              </div>

              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-surface-1">
                    <tr>
                      <th className="px-3 py-2 text-left">Fee Type</th>
                      <th className="px-3 py-2 text-left">Amount</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Reference</th>
                      <th className="px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(paymentsData?.payments || []).map((p) => (
                      <tr key={p.payment_id} className="border-t">
                        <td className="px-3 py-2">{p.fee_type}</td>
                        <td className="px-3 py-2">{formatAmount(p.amount)}</td>
                        <td className="px-3 py-2">{p.payment_status}</td>
                        <td className="px-3 py-2">{p.gateway_transaction_id || '-'}</td>
                        <td className="px-3 py-2">
                          {p.payment_status !== 'SUCCESS' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                markPaidMutation.mutate({
                                  providerId: selectedProviderId,
                                  paymentId: p.payment_id,
                                  data: {
                                    payment_method: paymentMethod,
                                    transaction_reference: txnRef || undefined,
                                    remarks: remarks || undefined
                                  }
                                })
                              }
                            >
                              Mark Paid
                            </Button>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                    {(paymentsData?.payments || []).length === 0 && (
                      <tr>
                        <td className="px-3 py-3 text-muted-foreground" colSpan={5}>
                          No payments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assign Billing Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Current: {billingData?.selected_model?.name || 'No plan selected'}
              </p>
              <div className="flex flex-col md:flex-row gap-2">
                <select
                  className="border rounded px-3 py-2 text-sm w-full"
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                >
                  <option value="">Select billing model</option>
                  {planOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={!planId || updateBillingMutation.isLoading}
                  onClick={() =>
                    updateBillingMutation.mutate({
                      providerId: selectedProviderId,
                      data: { plan_id: planId }
                    })
                  }
                >
                  Assign Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default OnboardingOperationsContent;
