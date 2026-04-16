import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/alert';
import { ContentLoader } from '@/components/loaders';
import { toast } from 'sonner';
import { useSettings, useUpdateSettings } from '@/services/settings.hooks';
import type { IBusinessSettings } from '@/services/settings.types';

const readBizNum = (
  b: IBusinessSettings | undefined,
  keys: (keyof IBusinessSettings | string)[],
  fallback: number
) => {
  if (!b) return fallback;
  for (const k of keys) {
    const v = b[k as keyof IBusinessSettings] as unknown;
    if (v !== undefined && v !== null && v !== '') {
      const n = typeof v === 'number' ? v : Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
};

const OnboardingFeeDefaultsContent = () => {
  const { data: settings, isLoading, isError, error, refetch } = useSettings();
  const updateMutation = useUpdateSettings();

  const [registration, setRegistration] = useState('');
  const [training, setTraining] = useState('');
  const [kit, setKit] = useState('');
  const [minWallet, setMinWallet] = useState('');

  useEffect(() => {
    const b = settings?.business;
    if (!b) return;
    setRegistration(
      String(
        readBizNum(
          b,
          ['onboarding_registration_fee', 'provider_registration_fee', 'registration_fee'],
          1000
        )
      )
    );
    setTraining(
      String(readBizNum(b, ['onboarding_training_fee', 'provider_training_fee', 'training_fee'], 0))
    );
    setKit(String(readBizNum(b, ['onboarding_kit_fee', 'provider_kit_fee', 'kit_fee'], 0)));
    setMinWallet(String(readBizNum(b, ['provider_minimum_wallet_balance'], 0)));
  }, [settings]);

  const handleSave = async () => {
    const reg = Math.max(0, Number(registration) || 0);
    const tr = Math.max(0, Number(training) || 0);
    const k = Math.max(0, Number(kit) || 0);
    const mw = Math.max(0, Number(minWallet) || 0);

    try {
      await updateMutation.mutateAsync({
        business: {
          onboarding_registration_fee: reg,
          onboarding_training_fee: tr,
          onboarding_kit_fee: k,
          provider_minimum_wallet_balance: mw
        }
      });
      toast.success('Default onboarding fees saved');
      await refetch();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save defaults';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 px-4 pt-4 md:px-6 md:pt-6">
      <div className="max-w-3xl space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Onboarding fee defaults</h1>
        <p className="text-sm text-muted-foreground">
          Configure the default registration, training, and kit fees that apply to{' '}
          <strong>new</strong> provider onboarding records when they are first created in the
          system. To override amounts for a specific provider after onboarding exists, use{' '}
          <strong>Provider Management</strong> → open the provider → <strong>Onboarding</strong>{' '}
          tab.
        </p>
      </div>

      {isError && (
        <Alert variant="danger">{(error as Error)?.message || 'Failed to load settings'}</Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Default amounts (all providers)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 max-w-xl">
          {isLoading ? (
            <ContentLoader />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="def-reg">Registration (onboarding) fee (₹)</Label>
                  <Input
                    id="def-reg"
                    type="number"
                    min={0}
                    step="0.01"
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Charged when the provider completes registration onboarding.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="def-training">Training fee (₹)</Label>
                  <Input
                    id="def-training"
                    type="number"
                    min={0}
                    step="0.01"
                    value={training}
                    onChange={(e) => setTraining(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="def-kit">Service / kit fee (₹)</Label>
                  <Input
                    id="def-kit"
                    type="number"
                    min={0}
                    step="0.01"
                    value={kit}
                    onChange={(e) => setKit(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Default kit delivery / service kit charge for new onboardings.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="def-wallet">Minimum wallet balance hint (₹)</Label>
                  <Input
                    id="def-wallet"
                    type="number"
                    min={0}
                    step="0.01"
                    value={minWallet}
                    onChange={(e) => setMinWallet(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in onboarding configuration where the backend expects a minimum wallet
                    reference.
                  </p>
                </div>
              </div>
              <Button type="button" onClick={handleSave} disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? 'Saving…' : 'Save defaults'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFeeDefaultsContent;
