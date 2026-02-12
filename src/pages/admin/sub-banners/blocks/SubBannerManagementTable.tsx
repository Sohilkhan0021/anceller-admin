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
import { ISubBanner, IPaginationMeta } from '@/services/subBanner.types';
import { ContentLoader } from '@/components/loaders';
import { getImageUrl } from '@/utils/imageUrl';

interface ISubBannerManagementTableProps {
  subBanners: ISubBanner[];
  pagination: IPaginationMeta | null;
  isLoading?: boolean;
  onViewSubBanner: (subBanner: ISubBanner) => void;
  onEditSubBanner: (subBanner: ISubBanner) => void;
  onDeleteSubBanner: (subBanner: ISubBanner) => void;
  onPageChange?: (page: number) => void;
}

const SubBannerManagementTable = ({
  subBanners,
  pagination,
  isLoading = false,
  onViewSubBanner,
  onEditSubBanner,
  onDeleteSubBanner,
  onPageChange
}: ISubBannerManagementTableProps) => {
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
          Sub-Banners {pagination ? `(${pagination.total})` : subBanners.length > 0 ? `(${subBanners.length})` : ''}
        </h3>
      </div>

      <div className="card-body p-0">
        {isLoading ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : subBanners.length === 0 ? (
          <div className="p-8 text-center">
            <KeenIcon icon="image" className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No sub-banners found</p>
            <p className="text-sm text-gray-500 mt-2">
              Click "Add a Sub-Banner" to create your first sub-banner
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Sub-Banner Title</TableHead>
                  <TableHead className="min-w-[120px]">Sub-Banner Image</TableHead>
                  <TableHead className="min-w-[150px]">Service</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subBanners.map((subBanner) => {
                  return (
                    <TableRow key={subBanner.sub_banner_id}>
                      <TableCell>
                        <div className="font-medium text-gray-900">{subBanner.title || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        {subBanner.image_url ? (
                          <div className="flex items-center">
                            <img
                              src={getImageUrl(subBanner.image_url) || ''}
                              alt={subBanner.title}
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
                        {subBanner.category ? (
                          <div className="flex items-center gap-2">
                            <KeenIcon icon="category" className="text-primary text-sm" />
                            <span className="text-sm text-gray-700">{subBanner.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">No category</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(subBanner.is_active)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <KeenIcon icon="dots-vertical" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewSubBanner(subBanner)}>
                              <KeenIcon icon="eye" className="me-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditSubBanner(subBanner)}>
                              <KeenIcon icon="notepad-edit" className="me-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteSubBanner(subBanner)}
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

      {pagination && (
        <div className="card-footer">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} sub-banners
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

export { SubBannerManagementTable };
