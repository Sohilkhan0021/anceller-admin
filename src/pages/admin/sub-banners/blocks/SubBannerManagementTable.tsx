import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ISubBanner, IPaginationMeta } from '@/services/subBanner.types';
import { ContentLoader } from '@/components/loaders';
import { getImageUrl } from '@/utils/imageUrl';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface ISubBannerManagementTableProps {
  subBanners: ISubBanner[];
  pagination: IPaginationMeta | null;
  isLoading?: boolean;
  onViewSubBanner: Function;
  onEditSubBanner: Function;
  onDeleteSubBanner: Function;
  onPageChange?: Function;
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
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          Sub-Banners{' '}
          {pagination
            ? `(${pagination.total})`
            : subBanners.length > 0
              ? `(${subBanners.length})`
              : ''}
        </h3>
      </div>

      <div className="card-body p-0">
        {isLoading ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : subBanners.length === 0 ? (
          <EmptyState
            title="No sub-banners found"
            description='Click "Add a Sub-Banner" to create your first sub-banner.'
            icon="image"
          />
        ) : (
          <div className="overflow-x-auto">
            <AdminDataTable>
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
                        <div className="font-medium text-foreground">
                          {subBanner.title || 'N/A'}
                        </div>
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
                        {subBanner.category ? (
                          <div className="flex items-center gap-2">
                            <KeenIcon icon="category" className="text-primary text-sm" />
                            <span className="text-sm text-foreground">
                              {subBanner.category.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">No category</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={subBanner.is_active ? 'active' : 'inactive'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Open sub-banner actions</span>
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
          itemLabel="sub-banners"
        />
      )}
    </div>
  );
};

export { SubBannerManagementTable };
