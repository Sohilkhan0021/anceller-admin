import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import {
  deleteOnboardingKitAsset,
  getOnboardingKitAssets,
  getOnboardingKitContent,
  updateOnboardingKitAssets,
  updateOnboardingKitContent,
  type IOnboardingKitAssets,
  type IOnboardingKitContent
} from '@/services/onboardingKit.service';
import { getImageUrl } from '@/utils/imageUrl';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const OnboardingKitManagementContent = () => {
  const queryClient = useQueryClient();
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [serviceKitFile, setServiceKitFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [trainingTitle, setTrainingTitle] = useState('');
  const [trainingDescription, setTrainingDescription] = useState('');
  const [trainingDetailsText, setTrainingDetailsText] = useState('');
  const [trainingEnabled, setTrainingEnabled] = useState(true);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceDetailsText, setServiceDetailsText] = useState('');
  const [serviceEnabled, setServiceEnabled] = useState(true);

  const {
    data: assets,
    isLoading,
    isError
  } = useQuery<IOnboardingKitAssets>(['onboarding-kit-assets'], getOnboardingKitAssets, {
    staleTime: 60000
  });

  // Training Kit & Service Kit: all content from API (no hardcoded data)
  useQuery<IOnboardingKitContent>(['onboarding-kit-content'], getOnboardingKitContent, {
    staleTime: 60000,
    onSuccess: (data) => {
      setTrainingTitle(data.training_kit.title || '');
      setTrainingDescription(data.training_kit.description || '');
      setTrainingDetailsText((data.training_kit.details || []).join('\n'));
      setTrainingEnabled(!!data.training_kit.is_enabled);
      setServiceTitle(data.service_kit.title || '');
      setServiceDescription(data.service_kit.description || '');
      setServiceDetailsText((data.service_kit.details || []).join('\n'));
      setServiceEnabled(!!data.service_kit.is_enabled);
    }
  });

  const handleUpload = async () => {
    if (!trainingFile && !serviceKitFile) {
      toast.error('Select at least one image to upload');
      return;
    }
    setUploading(true);
    try {
      await updateOnboardingKitAssets({
        training_kit_image: trainingFile || undefined,
        service_kit_image: serviceKitFile || undefined
      });
      toast.success('Kit assets updated successfully');
      setTrainingFile(null);
      setServiceKitFile(null);
      queryClient.invalidateQueries(['onboarding-kit-assets']);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update kit assets');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAsset = async (assetType: 'training_kit' | 'service_kit') => {
    try {
      await deleteOnboardingKitAsset(assetType);
      toast.success('Image deleted successfully');
      queryClient.invalidateQueries(['onboarding-kit-assets']);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete image');
    }
  };

  const handleSaveContent = async () => {
    setSavingContent(true);
    try {
      await updateOnboardingKitContent({
        training_kit: {
          title: trainingTitle,
          description: trainingDescription,
          details: trainingDetailsText
            .split('\n')
            .map((x) => x.trim())
            .filter(Boolean),
          is_enabled: trainingEnabled
        } as any,
        service_kit: {
          title: serviceTitle,
          description: serviceDescription,
          details: serviceDetailsText
            .split('\n')
            .map((x) => x.trim())
            .filter(Boolean),
          is_enabled: serviceEnabled
        } as any
      });
      toast.success('Kit details updated successfully');
      queryClient.invalidateQueries(['onboarding-kit-content']);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update kit details');
    } finally {
      setSavingContent(false);
    }
  };

  const trainingPreview = trainingFile
    ? URL.createObjectURL(trainingFile)
    : assets?.training_kit_image_url
      ? getImageUrl(assets.training_kit_image_url)
      : null;
  const serviceKitPreview = serviceKitFile
    ? URL.createObjectURL(serviceKitFile)
    : assets?.service_kit_image_url
      ? getImageUrl(assets.service_kit_image_url)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Training & Service Kit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload or update the default images shown for Training and Service Kit on the provider
          app. To update payment status and training/kit completion per provider, use Provider
          Management → open a provider → Onboarding tab.
        </p>
      </div>

      {isError && <Alert variant="danger">Failed to load kit assets</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Kit assets (images for provider app)</CardTitle>
          <p className="text-sm text-muted-foreground">
            These images appear on the provider home screen for training and service kit cards.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8">
              <ContentLoader />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-base font-medium">Training Kit Image</Label>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex flex-col items-center justify-center">
                  {trainingPreview ? (
                    <img
                      src={trainingPreview}
                      alt="Training kit"
                      className="max-h-48 object-contain rounded"
                    />
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                      <KeenIcon icon="image" className="text-4xl" />
                      <span className="text-sm">No image set</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-white"
                    onChange={(e) => setTrainingFile(e.target.files?.[0] || null)}
                  />
                  {!!assets?.training_kit_image_url && (
                    <Button variant="outline" onClick={() => handleDeleteAsset('training_kit')}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Service Kit Image</Label>
                <div className="border rounded-lg p-4 bg-surface-1 min-h-[200px] flex flex-col items-center justify-center">
                  {serviceKitPreview ? (
                    <img
                      src={serviceKitPreview}
                      alt="Service kit"
                      className="max-h-48 object-contain rounded"
                    />
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                      <KeenIcon icon="image" className="text-4xl" />
                      <span className="text-sm">No image set</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-white"
                    onChange={(e) => setServiceKitFile(e.target.files?.[0] || null)}
                  />
                  {!!assets?.service_kit_image_url && (
                    <Button variant="outline" onClick={() => handleDeleteAsset('service_kit')}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {(trainingFile || serviceKitFile) && (
            <div className="mt-6 pt-6 border-t">
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload & save'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training and service kit details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage content shown on provider onboarding cards.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label>Training title</Label>
              <input
                className="input"
                value={trainingTitle}
                onChange={(e) => setTrainingTitle(e.target.value)}
              />
              <Label>Training description</Label>
              <textarea
                className="textarea"
                value={trainingDescription}
                onChange={(e) => setTrainingDescription(e.target.value)}
              />
              <Label>Training details (one per line)</Label>
              <textarea
                className="textarea min-h-[140px]"
                value={trainingDetailsText}
                onChange={(e) => setTrainingDetailsText(e.target.value)}
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={trainingEnabled}
                  onChange={(e) => setTrainingEnabled(e.target.checked)}
                />
                Training section enabled
              </label>
            </div>
            <div className="space-y-3">
              <Label>Service kit title</Label>
              <input
                className="input"
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
              />
              <Label>Service kit description</Label>
              <textarea
                className="textarea"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
              />
              <Label>Service kit details (one per line)</Label>
              <textarea
                className="textarea min-h-[140px]"
                value={serviceDetailsText}
                onChange={(e) => setServiceDetailsText(e.target.value)}
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={serviceEnabled}
                  onChange={(e) => setServiceEnabled(e.target.checked)}
                />
                Service kit section enabled
              </label>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t">
            <Button onClick={handleSaveContent} disabled={savingContent}>
              {savingContent ? 'Saving...' : 'Save kit details'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provider onboarding status & payment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To update registration fee paid, training fee paid, kit fee paid, and to mark training
            completed or kit delivered for a specific provider, go to Provider Management, open the
            provider profile, and use the <strong>Onboarding</strong> tab.
          </p>
          <Link to="/admin/providers">
            <Button variant="outline">
              <KeenIcon icon="shop" className="me-2" />
              Open Provider Management
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingKitManagementContent;
