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
import { ISubBanner } from '@/services/subBanner.types';

interface IDeleteSubBannerModalProps {
  subBanner: ISubBanner | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subBannerId: string) => Promise<void>;
  isDeleting?: boolean;
}

const DeleteSubBannerModal = ({
  subBanner,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false
}: IDeleteSubBannerModalProps) => {
  const handleConfirm = async () => {
    if (subBanner?.sub_banner_id) {
      await onConfirm(subBanner.sub_banner_id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <KeenIcon icon="trash" className="text-danger" />
            Delete Sub-Banner
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the sub-banner <strong className="text-black">"{subBanner?.title || 'this sub-banner'}"</strong>?
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

export { DeleteSubBannerModal };
