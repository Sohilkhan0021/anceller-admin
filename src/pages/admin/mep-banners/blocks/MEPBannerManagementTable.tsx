import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IMEPBanner } from '@/services/mepBanner.types';
import { ContentLoader } from '@/components/loaders';
import { getImageUrl } from '@/utils/imageUrl';

interface IMEPBannerManagementTableProps {
  banners: IMEPBanner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading?: boolean;
  onViewBanner: (banner: IMEPBanner) => void;
  onEditBanner: (banner: IMEPBanner) => void;
  onDeleteBanner: (banner: IMEPBanner) => void;
  onBannerTypeChange?: (banner: IMEPBanner, newType: 'offer' | 'buy_banner') => void;
  onPageChange?: (page: number) => void;
}

const MEPBannerManagementTable = ({
  banners,
  pagination,
  isLoading = false,
  onViewBanner,
  onEditBanner,
  onDeleteBanner,
  onBannerTypeChange,
  onPageChange
}: IMEPBannerManagementTableProps) => {
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge variant="default" className="bg-success text-white">Active</Badge>;
    } else {
      return <Badge variant="outline">Inactive</Badge>;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          MEP Banners {pagination ? `(${pagination.total})` : banners.length > 0 ? `(${banners.length})` : ''}
        </h3>
      </div>

      <div className="card-body p-0">
        {isLoading ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center">
            <KeenIcon icon="image" className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No MEP banners found</p>
            <p className="text-sm text-gray-500 mt-2">
              Click "Add a MEP Banner" to create your first MEP banner
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">MEP Banner Title</TableHead>
                  <TableHead className="min-w-[120px]">Banner Image</TableHead>
                  <TableHead className="min-w-[120px]">Banner Type</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => {
                  return (
                    <TableRow key={banner.mep_banner_id}>
                      <TableCell>
                        <div className="font-medium text-gray-900">{banner.title || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        {banner.image_url ? (
                          <div className="flex items-center">
                            <img
                              src={getImageUrl(banner.image_url) || ''}
                              alt={banner.title}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No image</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`mep_banner_type_offer_${banner.mep_banner_id}`}
                                name={`mep_banner_type_${banner.mep_banner_id}`}
                                value="offer"
                                checked={!banner.banner_type || banner.banner_type === 'offer'}
                                onChange={() => onBannerTypeChange?.(banner, 'offer')}
                                className="w-4 h-4 text-primary focus:ring-primary"
                                disabled={isLoading}
                              />
                              <Label 
                                htmlFor={`mep_banner_type_offer_${banner.mep_banner_id}`} 
                                className="font-normal cursor-pointer text-sm"
                              >
                                Offer
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`mep_banner_type_buy_${banner.mep_banner_id}`}
                                name={`mep_banner_type_${banner.mep_banner_id}`}
                                value="buy_banner"
                                checked={banner.banner_type === 'buy_banner'}
                                onChange={() => onBannerTypeChange?.(banner, 'buy_banner')}
                                className="w-4 h-4 text-primary focus:ring-primary"
                                disabled={isLoading}
                              />
                              <Label 
                                htmlFor={`mep_banner_type_buy_${banner.mep_banner_id}`} 
                                className="font-normal cursor-pointer text-sm"
                              >
                                Buy Banner
                              </Label>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(banner.is_active)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <KeenIcon icon="dots-vertical" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewBanner(banner)}>
                              <KeenIcon icon="eye" className="me-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditBanner(banner)}>
                              <KeenIcon icon="notepad-edit" className="me-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteBanner(banner)}
                              className="text-danger"
                            >
                              <KeenIcon icon="trash" className="me-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="card-footer">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} MEP banners
            </div>
            {onPageChange && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  <KeenIcon icon="arrow-left" className="me-1" />
                  Previous
                </Button>
                <div className="text-sm text-gray-600 px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                >
                  Next
                  <KeenIcon icon="arrow-right" className="ms-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { MEPBannerManagementTable };
