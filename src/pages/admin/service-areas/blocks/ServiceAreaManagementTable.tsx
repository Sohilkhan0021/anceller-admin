import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IServiceArea, IGetServiceAreasResponse } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface IServiceAreaManagementTableProps {
  areas: IServiceArea[];
  pagination: IGetServiceAreasResponse['pagination'] | null;
  isLoading?: boolean;
  onEdit: Function;
  onDelete: Function;
  onPageChange?: Function;
}

const ServiceAreaManagementTable = ({
  areas,
  pagination,
  isLoading = false,
  onEdit,
  onDelete,
  onPageChange
}: IServiceAreaManagementTableProps) => {
  const formatRadius = (radius?: string | number | null) => {
    if (radius === null || radius === undefined) return 'N/A';
    const value = typeof radius === 'string' ? parseFloat(radius) : radius;
    if (Number.isNaN(value)) return 'N/A';
    return `${value} km`;
  };

  return (
    <div className="card">
      <div className="card-body p-0">
        {isLoading ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : areas.length === 0 ? (
          <EmptyState
            title="No service areas found"
            description="Try adjusting your search or add a new service area."
            icon="map"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <AdminDataTable className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead className="hidden lg:table-cell">State</TableHead>
                    <TableHead>Radius</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areas.map((area) => (
                    <TableRow key={area.area_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <KeenIcon icon="map" className="text-primary text-sm" />
                          <div className="flex flex-col">
                            <span>{area.area_name}</span>
                            {area.landmark && (
                              <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                                {area.landmark}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{area.city || 'N/A'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{area.state || 'N/A'}</TableCell>
                      <TableCell>{formatRadius(area.radius_km)}</TableCell>
                      <TableCell>
                        <StatusBadge status={area.is_active ? 'active' : 'inactive'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => onEdit(area)}>
                            <KeenIcon icon="notepad-edit" className="me-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(area.area_id)}
                          >
                            <KeenIcon icon="trash" className="me-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </AdminDataTable>
            </div>

            {pagination && onPageChange && (
              <AdminPagination
                page={pagination.page}
                total={pagination.total}
                totalPages={pagination.totalPages}
                limit={pagination.limit}
                onPageChange={onPageChange}
                isLoading={isLoading}
                itemLabel="service areas"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export { ServiceAreaManagementTable };
