import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/alert';
import { ContentLoader } from '@/components/loaders';
import { toast } from 'sonner';
import { useSettings, useUpdateSettings } from '@/services/settings.hooks';

const ConsultationFeeContent = () => {
  const { data: settings, isLoading, isError, error, refetch } = useSettings();
  const updateMutation = useUpdateSettings();
  const [fee, setFee] = useState('500');

  useEffect(() => {
    const configured = settings?.business?.consultation_booking_fee;
    const amount = Number(configured);
    setFee(String(Number.isFinite(amount) && amount > 0 ? amount : 500));
  }, [settings]);

  const handleSave = async () => {
    const feeAmount = Math.max(0, Number(fee) || 0);

    try {
      await updateMutation.mutateAsync({
        business: {
          consultation_booking_fee: feeAmount
        }
      });
      toast.success('Consultation fee saved');
      await refetch();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to save consultation fee';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 px-4 pt-4 md:px-6 md:pt-6">
      <div className="max-w-3xl space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Consultation fee</h1>
        <p className="text-sm text-muted-foreground">
          Set the amount charged from users when they book a consultation. Booking is confirmed only
          after successful payment.
        </p>
      </div>

      {isError && (
        <Alert variant="danger">{(error as Error)?.message || 'Failed to load settings'}</Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Book a Consultation amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 max-w-xl">
          {isLoading ? (
            <ContentLoader />
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="consultation-fee">Consultation fee (INR)</Label>
                <Input
                  id="consultation-fee"
                  type="number"
                  min={0}
                  step="1"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This amount is used by user-side Razorpay consultation booking flow.
                </p>
              </div>
              <Button type="button" onClick={handleSave} disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? 'Saving…' : 'Save fee'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationFeeContent;
