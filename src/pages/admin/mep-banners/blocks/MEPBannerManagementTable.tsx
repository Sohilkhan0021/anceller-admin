import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IMEPBanner } from '@/services/mepBanner.types';
import { ContentLoader } from '@/components/loaders';
import { getImageUrl } from '@/utils/imageUrl';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface IMEPBannerManagementTableProps {
  banners: IMEPBanner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading?: boolean;
  onViewBanner: Function;
  onEditBanner: Function;
  onDeleteBanner: Function;
  onBannerTypeChange?: Function;
  onPageChange?: Function;
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
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          MEP Banners{' '}
          {pagination ? `(${pagination.total})` : banners.length > 0 ? `(${banners.length})` : ''}
        </h3>
      </div>

      <div className="card-body p-0">
        {isLoading ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : banners.length === 0 ? (
          <EmptyState
            title="No MEP banners found"
            description='Click "Add a MEP Banner" to create your first MEP banner.'
            icon="image"
          />
        ) : (
          <div className="overflow-x-auto">
            <AdminDataTable>
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
                        <div className="font-medium text-foreground">{banner.title || 'N/A'}</div>
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
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No image</span>
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
                                className="w-4 h-4 text-primary focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2"
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
                                className="w-4 h-4 text-primary focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2"
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
                      <TableCell>
                        <StatusBadge status={banner.is_active ? 'active' : 'inactive'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Open MEP banner actions</span>
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
            </AdminDataTable>
          </div>
        )}
      </div>

      {pagination && onPageChange && (
        <AdminPagination
          page={pagination.page}
          total={pagination.total}
          totalPages={pagination.totalPages}
          limit={pagination.limit}
          onPageChange={onPageChange}
          isLoading={isLoading}
          itemLabel="MEP banners"
        />
      )}
    </div>
  );
};

export { MEPBannerManagementTable };
