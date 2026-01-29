import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { IBanner, IPaginationMeta } from '@/services/banner.types';
import { ContentLoader } from '@/components/loaders';
import { getImageUrl } from '@/utils/imageUrl';

interface IBannerManagementTableProps {
  banners: IBanner[];
  pagination: IPaginationMeta | null;
  isLoading?: boolean;
  onViewBanner: (banner: IBanner) => void;
  onEditBanner: (banner: IBanner) => void;
  onDeleteBanner: (banner: IBanner) => void;
  onPageChange?: (page: number) => void;
}

const BannerManagementTable = ({
  banners,
  pagination,
  isLoading = false,
  onViewBanner,
  onEditBanner,
  onDeleteBanner,
  onPageChange
}: IBannerManagementTableProps) => {
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
          Banners {pagination ? `(${pagination.total})` : banners.length > 0 ? `(${banners.length})` : ''}
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
            <p className="text-gray-600">No banners found</p>
            <p className="text-sm text-gray-500 mt-2">
              Click "Add a Banner" to create your first banner
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banner Title</TableHead>
                    <TableHead>Banner Image</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => {
                    return (
                      <TableRow key={banner.banner_id}>
                        <TableCell>
                        <div className="font-medium">{banner.title || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        {banner.image_url ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(banner.image_url) || ''}
                              alt={banner.title}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
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
                      <TableCell>{getStatusBadge(banner.is_active)}</TableCell>
                      <TableCell>
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

      {/* Pagination Controls */}
      {pagination && (
        <div className="card-footer">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} banners
            </div>
            {pagination.totalPages > 1 && onPageChange && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage || isLoading}
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
                  disabled={!pagination.hasNextPage || isLoading}
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

export { BannerManagementTable };
