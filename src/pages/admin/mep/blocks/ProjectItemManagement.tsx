import { useState, useEffect, useCallback } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { getImageUrl } from '@/utils/imageUrl';
import { ProjectItemForm } from '../forms/ProjectItemForm';

interface IProjectItemTableProps {
  onEditProjectItem?: (projectItem: any) => void;
  onAddProjectItem?: () => void;
}

const ProjectItemManagement = ({ onEditProjectItem, onAddProjectItem }: IProjectItemTableProps) => {
  const [sortBy, setSortBy] = useState('displayOrder');
  const [projectFilter, setProjectFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [projectItems, setProjectItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectItemToDelete, setProjectItemToDelete] = useState<string | null>(null);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const pagination = {
    total: projectItems.length,
    page: currentPage,
    limit: pageSize,
    totalPages: Math.ceil(projectItems.length / pageSize)
  };

  const refetch = () => {
    // TODO: Implement API call
  };

  // Column visibility state - description and popularity hidden by default
  const [columnVisibility, setColumnVisibility] = useState({
    order: true,
    projectItem: true,
    project: true,
    description: false, // Hidden by default
    status: true,
    popularity: false, // Hidden by default
    bookings: true,
    revenue: true,
    actions: true,
  });

  const toggleColumn = (column: keyof typeof columnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleToggleStatus = useCallback((projectItemId: string, newStatus: boolean) => {
    // TODO: Implement API call
    setProjectItems(prev => prev.map(p => p.id === projectItemId ? { ...p, status: newStatus ? 'active' : 'inactive' } : p));
    toast.success('Project item status updated');
  }, []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProjectItem, setEditingProjectItem] = useState<any>(null);

  const handleEditProjectItem = (projectItemId: string) => {
    const projectItem = projectItems.find(p => p.id === projectItemId);
    if (projectItem) {
      setEditingProjectItem(projectItem);
      setIsFormOpen(true);
    }
  };

  const handleAddProjectItem = () => {
    setEditingProjectItem(null);
    setIsFormOpen(true);
  };

  const handleSaveProjectItem = (projectItemData: any) => {
    if (editingProjectItem) {
      setProjectItems(prev => prev.map(p => p.id === editingProjectItem.id ? { ...p, ...projectItemData } : p));
      toast.success('Project item updated successfully');
    } else {
      const newProjectItem: any = {
        id: `project-item-${Date.now()}`,
        ...projectItemData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProjectItems(prev => [...prev, newProjectItem]);
      toast.success('Project item created successfully');
    }
    setIsFormOpen(false);
    setEditingProjectItem(null);
  };

  const handleDeleteClick = (projectItemId: string) => {
    setProjectItemToDelete(projectItemId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectItemToDelete) {
      setProjectItems(prev => prev.filter(p => p.id !== projectItemToDelete));
      toast.success('Project item deleted successfully');
      setDeleteDialogOpen(false);
      setProjectItemToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    );
  };
  
  const getPopularityBadge = (popularity: number) => {
    if (popularity >= 90) return { variant: 'success', text: 'Very Popular' };
    if (popularity >= 80) return { variant: 'info', text: 'Popular' };
    if (popularity >= 70) return { variant: 'warning', text: 'Moderate' };
    return { variant: 'secondary', text: 'Low' };
  };

  // Extract unique projects from projectItems for filter dropdown
  const uniqueProjects = Array.from(
    new Map(projectItems
      .filter(item => item.project_id)
      .map(item => [item.project_id, {
        id: item.project_id!,
        name: item.project_name || 'Unknown'
      }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Client-side filtering for project (if API doesn't support it)
  let filteredProjectItems = projectItems.filter(item => {
    const matchesProject = projectFilter === 'all' || item.project_id === projectFilter;
    return matchesProject;
  });

  // Sort project items (client-side sorting)
  filteredProjectItems = [...filteredProjectItems].sort((a, b) => {
    switch (sortBy) {
      case 'displayOrder':
        return (a.displayOrder || 999) - (b.displayOrder || 999);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'popularity':
        return (b.popularity || 0) - (a.popularity || 0);
      case 'bookings':
        return (b.bookings || 0) - (a.bookings || 0);
      case 'revenue':
        return (b.revenue || 0) - (a.revenue || 0);
      default:
        return (a.displayOrder || 999) - (b.displayOrder || 999);
    }
  });

  return (
    <div className="card max-w-full w-full overflow-hidden">
      <div className="card-header max-w-full w-full overflow-hidden">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-row items-center justify-between w-full gap-4">
            <div>
              <h3 className="card-title">
                Project Item Management {pagination ? `(${pagination.total})` : `(${filteredProjectItems.length})`}
              </h3>
              <p className="text-sm text-gray-600">Manage project item pricing and availability</p>
            </div>

            <Button size="sm" onClick={handleAddProjectItem}>
              <KeenIcon icon="plus" className="me-2" />
              Add New Project Item
            </Button>
          </div>

          {/* Error State */}
          {false && (
            <Alert variant="danger">
              <div className="flex items-center justify-between">
                <span>
                  Failed to load project items. Please try again.
                </span>
                <button
                  onClick={() => refetch()}
                  className="text-sm underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {uniqueProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="displayOrder">Display Order</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="bookings">Bookings</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* Columns Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-40">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 max-h-[400px] overflow-y-auto">
                <div className="p-2 space-y-2">
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-order"
                      checked={columnVisibility.order}
                      onCheckedChange={() => toggleColumn('order')}
                    />
                    <label htmlFor="col-order" className="text-sm font-medium leading-none cursor-pointer">
                      Order
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-projectItem"
                      checked={columnVisibility.projectItem}
                      onCheckedChange={() => toggleColumn('projectItem')}
                    />
                    <label htmlFor="col-projectItem" className="text-sm font-medium leading-none cursor-pointer">
                      Project Item Name
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-project"
                      checked={columnVisibility.project}
                      onCheckedChange={() => toggleColumn('project')}
                    />
                    <label htmlFor="col-project" className="text-sm font-medium leading-none cursor-pointer">
                      Project
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-description"
                      checked={columnVisibility.description}
                      onCheckedChange={() => toggleColumn('description')}
                    />
                    <label htmlFor="col-description" className="text-sm font-medium leading-none cursor-pointer">
                      Description
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-status"
                      checked={columnVisibility.status}
                      onCheckedChange={() => toggleColumn('status')}
                    />
                    <label htmlFor="col-status" className="text-sm font-medium leading-none cursor-pointer">
                      Status
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-bookings"
                      checked={columnVisibility.bookings}
                      onCheckedChange={() => toggleColumn('bookings')}
                    />
                    <label htmlFor="col-bookings" className="text-sm font-medium leading-none cursor-pointer">
                      Bookings
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 px-2 py-1.5">
                    <Checkbox
                      id="col-revenue"
                      checked={columnVisibility.revenue}
                      onCheckedChange={() => toggleColumn('revenue')}
                    />
                    <label htmlFor="col-revenue" className="text-sm font-medium leading-none cursor-pointer">
                      Revenue
                    </label>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="card-body p-0 w-full overflow-hidden">
        {isLoading && !isFetching ? (
          <div className="p-8">
            <ContentLoader />
          </div>
        ) : filteredProjectItems.length === 0 ? (
          <div className="p-8 text-center">
            <KeenIcon icon="tag" className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No project items found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="scrollable-x-auto" style={{ width: '100%', maxWidth: '100%' }}>
              <table className="caption-bottom text-sm" style={{ minWidth: '1200px' }}>
                <TableHeader>
                  <TableRow>
                    {columnVisibility.order && <TableHead className="w-[50px] text-center">Order</TableHead>}
                    {columnVisibility.projectItem && <TableHead className="w-[200px]">Name</TableHead>}
                    {columnVisibility.project && <TableHead className="w-[200px]">Project</TableHead>}
                    {columnVisibility.description && <TableHead className="w-[160px]">Description</TableHead>}
                    {columnVisibility.status && <TableHead className="w-[100px]">Status</TableHead>}
                    {columnVisibility.popularity && <TableHead className="w-[90px]">Popularity</TableHead>}
                    {columnVisibility.bookings && <TableHead className="w-[70px] text-center">Bookings</TableHead>}
                    {columnVisibility.revenue && <TableHead className="w-[90px] text-center">Revenue</TableHead>}
                    {columnVisibility.actions && <TableHead className="w-[60px] text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjectItems.map((projectItem, index) => {
                    const displayOrder = projectItem.displayOrder ?? (index + 1);
                    return (
                      <TableRow key={projectItem.id}>
                        {columnVisibility.order && (
                          <TableCell className="w-[50px]">
                            <div className="text-sm font-medium text-center">{displayOrder}</div>
                          </TableCell>
                        )}
                        {columnVisibility.projectItem && (
                          <TableCell className="w-[200px]">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const imageUrl = projectItem.image_url || projectItem.imageUrl || projectItem.image || '';
                                const fullImageUrl = getImageUrl(imageUrl);

                                if (!fullImageUrl && imageUrl) {
                                  return (
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                                      <KeenIcon icon="image" className="text-gray-400 text-lg" />
                                    </div>
                                  );
                                }

                                return fullImageUrl ? (
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                    <img
                                      src={fullImageUrl}
                                      alt={projectItem.name || 'Project Item'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200 flex items-center justify-center">
                                    <KeenIcon icon="image" className="text-gray-400 text-lg" />
                                  </div>
                                );
                              })()}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{projectItem.name || 'N/A'}</div>
                                <div className="text-xs text-gray-500 truncate">ID: {projectItem.id || 'N/A'}</div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                      {columnVisibility.project && (
                        <TableCell className="w-[200px]">
                          <div className="font-medium text-sm truncate" title={projectItem.project_name || '—'}>
                            {projectItem.project_name || '—'}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.description && (
                        <TableCell className="w-[160px]">
                          <div className="text-sm text-gray-600 truncate" style={{ maxWidth: '160px' }} title={projectItem.description || '—'}>
                            {projectItem.description || '—'}
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.status && (
                        <TableCell className="w-[100px]">
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Switch
                                      checked={projectItem.status === 'active'}
                                      onCheckedChange={(checked) => handleToggleStatus(projectItem.id, checked)}
                                      className="service-status-switch flex-shrink-0 data-[state=checked]:bg-danger data-[state=unchecked]:bg-transparent"
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Changes affect new bookings only</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div className="flex-shrink-0">
                              {getStatusBadge(projectItem.status || 'inactive')}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.popularity && (
                        <TableCell className="w-[90px]">
                          <Badge variant="outline" className="badge-outline text-xs whitespace-nowrap px-1.5 py-0.5">
                            {getPopularityBadge(projectItem.popularity || 0).text}
                          </Badge>
                        </TableCell>
                      )}
                      {columnVisibility.bookings && (
                        <TableCell className="w-[70px]">
                          <div className="text-center">
                            <div className="font-semibold text-sm">{projectItem.bookings || 0}</div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.revenue && (
                        <TableCell className="w-[90px]">
                          <div className="text-center">
                            <div className="font-semibold text-success text-sm whitespace-nowrap">
                              {formatCurrency(projectItem.revenue)}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {columnVisibility.actions && (
                        <TableCell className="w-[60px]">
                          <div className="flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-shrink-0 p-1 h-8 w-8">
                                  <KeenIcon icon="dots-vertical" className="text-base" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditProjectItem(projectItem.id)}>
                                  <KeenIcon icon="pencil" className="me-2" />
                                  Edit Project Item
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(projectItem.id)}
                                  className="text-danger"
                                >
                                  <KeenIcon icon="trash" className="me-2" />
                                  Delete Project Item
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="card-footer">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} project items
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (pagination.page > 1 && !isFetching) {
                          setCurrentPage(pagination.page - 1);
                        }
                      }}
                      disabled={pagination.page <= 1 || isFetching}
                    >
                      <KeenIcon icon="arrow-left" className="me-1" />
                      Previous
                    </Button>
                    <div className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (pagination.page < pagination.totalPages && !isFetching) {
                          setCurrentPage(pagination.page + 1);
                        }
                      }}
                      disabled={pagination.page >= pagination.totalPages || isFetching}
                    >
                      Next
                      <KeenIcon icon="arrow-right" className="ms-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Project Item Form Modal */}
      <ProjectItemForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProjectItem(null);
        }}
        onSave={handleSaveProjectItem}
        projectItemData={editingProjectItem}
        availableProjects={projects}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="trash" className="text-danger" />
              Delete Project Item
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the project item <strong className="text-black">"{projectItemToDelete ? projectItems.find(p => p.id === projectItemToDelete)?.name || 'this project item' : 'this project item'}"</strong>?
              This action cannot be undone.
            </p>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              <KeenIcon icon="trash" className="me-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ProjectItemManagement };
