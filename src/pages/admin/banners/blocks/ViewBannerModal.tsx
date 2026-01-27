import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IBanner } from '@/services/banner.types';
import { useBannerById } from '@/services/banner.hooks';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { getImageUrl } from '@/utils/imageUrl';

interface IViewBannerModalProps {
  banner: IBanner | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewBannerModal = ({ banner, isOpen, onClose }: IViewBannerModalProps) => {
  // Fetch banner details when modal opens
  const {
    banner: bannerDetails,
    isLoading,
    isError,
    error,
    refetch
  } = useBannerById(banner?.banner_id || null, {
    enabled: isOpen && banner !== null
  });

  // Use fetched banner details if available, otherwise fallback to prop
  const displayBanner = bannerDetails || banner;

  if (!isOpen) return null;

  if (!displayBanner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="image" className="text-primary" />
            {displayBanner.title || 'Banner Details'}
          </DialogTitle>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <ContentLoader />
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <Alert variant="danger" className="my-4">
            <div className="flex items-center justify-between">
              <span>
                {error?.message || 'Failed to load banner details. Please try again.'}
              </span>
              <button
                onClick={() => refetch()}
                className="text-sm underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </Alert>
        )}

        {/* Banner Content */}
        {!isLoading && !isError && displayBanner && (
          <div className="mt-4">
            {displayBanner.image_url ? (
              <div className="w-full">
                <img
                  src={getImageUrl(displayBanner.image_url) || ''}
                  alt={displayBanner.title}
                  className="w-full h-auto rounded-lg border border-gray-200"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect fill="%23ddd" width="800" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="24"%3ENo Image Available%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No image available</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ViewBannerModal };
