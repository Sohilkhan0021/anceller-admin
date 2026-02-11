import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
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
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">View Banner</DialogTitle>
        <DialogDescription className="sr-only">
          View banner image: {displayBanner.title || 'Banner'}
        </DialogDescription>
        {/* Close Button - Top Right */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white shadow-md rounded-full w-8 h-8 p-0 flex-shrink-0"
        >
          <KeenIcon icon="cross" className="text-lg" />
        </Button>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[500px]">
            <ContentLoader />
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="p-6">
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
          </div>
        )}

        {/* Banner Image Only */}
        {!isLoading && !isError && displayBanner && (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            {displayBanner.image_url ? (
              <img
                src={getImageUrl(displayBanner.image_url) || ''}
                alt={displayBanner.title || 'Banner'}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect fill="%23ddd" width="800" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="24"%3ENo Image Available%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No image available</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { ViewBannerModal };
