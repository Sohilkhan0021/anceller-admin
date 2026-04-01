import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { IServiceArea, IGetServiceAreasResponse } from '@/services';
import { ContentLoader } from '@/components/loaders';

interface IServiceAreaManagementTableProps {
  areas: IServiceArea[];
  pagination: IGetServiceAreasResponse['pagination'] | null;
  isLoading?: boolean;
  onEdit: (area: IServiceArea) => void;
  onDelete: (areaId: string) => void;
  onPageChange?: (page: number) => void;
}

const ServiceAreaManagementTable = ({
  areas,
  pagination,
  isLoading = false,
  onEdit,
  onDelete,
  onPageChange,
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
          <div className="p-8 text-center">
            <KeenIcon icon="map" className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No service areas found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or add a new service area.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="min-w-full">
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
                              <span className="text-xs text-gray-500 truncate max-w-[220px]">
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
                        <span
                          className={
                            area.is_active
                              ? 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-success text-white'
                              : 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700'
                          }
                        >
                          {area.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(area)}
                          >
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
              </Table>
            </div>

            {pagination && onPageChange && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => onPageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => onPageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export { ServiceAreaManagementTable };

