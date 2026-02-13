import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { IMEPBanner } from '@/services/mepBanner.types';

interface IDeleteMEPBannerModalProps {
  banner: IMEPBanner | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bannerId: string) => Promise<void>;
  isDeleting?: boolean;
}

const DeleteMEPBannerModal = ({
  banner,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false
}: IDeleteMEPBannerModalProps) => {
  const handleConfirm = async () => {
    if (banner?.mep_banner_id) {
      await onConfirm(banner.mep_banner_id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="trash" className="text-danger" />
            Delete MEP Banner
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the MEP banner <strong className="text-black">"{banner?.title || 'this MEP banner'}"</strong>?
            This action cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Deleting...
              </span>
            ) : (
              <>
                <KeenIcon icon="trash" className="me-2" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteMEPBannerModal };
