import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ProjectForm } from '../forms/ProjectForm';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContentLoader } from '@/components/loaders';
import { Alert } from '@/components/alert';
import { getImageUrl } from '@/utils/imageUrl';
import { useProjects, useDeleteProject, useUpdateProject } from '@/services';

interface IProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  displayOrder?: number;
  image_url?: string;
  icon_url?: string;
  imageUrl?: string;
  image?: string;
  is_active?: boolean;
}

interface IProjectManagementProps {
  onCreateProject?: (project: any) => void;
  onUpdateProject?: (project: any) => void;
  onDeleteProject?: (projectId: string) => void;
}

const ProjectManagement = ({
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}: IProjectManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<IProject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { projects, pagination, isLoading, isError, error, refetch, isFetching } = useProjects({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === 'all' ? '' : statusFilter,
    search: debouncedSearch,
  });

  const deleteProjectMutation = useDeleteProject({
    onSuccess: () => {
      toast.success('Project deleted successfully');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete project');
    }
  });

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: IProject) => {
    const projectWithId = {
      ...project,
      id: project.id || (project as any).public_id || (project as any).project_id
    };
    setEditingProject(projectWithId);
    setIsFormOpen(true);
  };

  const handleSaveProject = (projectData: any) => {
    // This function is called from ProjectForm's onSave, but ProjectForm now handles mutations directly
    // So this is just a placeholder - the actual save happens in ProjectForm
  };

  const updateProjectMutation = useUpdateProject({
    onSuccess: () => {
      toast.success('Project status updated');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update project status');
    }
  });

  const handleToggleStatus = useCallback((projectId: string, checked: boolean) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    updateProjectMutation.mutate({
      id: projectId,
      name: project.name,
      description: project.description || '',
      image_url: (project as any).image_url || (project as any).imageUrl || undefined,
      sort_order: project.displayOrder || (project as any).sort_order || 1,
      is_active: checked
    });
  }, [projects, updateProjectMutation]);

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (project: IProject) => {
    setViewingProject(project);
    setViewDetailsOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete);
      onDeleteProject?.(projectToDelete);
    }
  };

  const handleUpdateDisplayOrder = async (projectId: string, newOrder: number) => {
    try {
      // TODO: Implement API call for display order update
      toast.success('Display order updated');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update display order');
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success text-white">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    );
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex flex-row items-center justify-between w-full gap-4">
            <div>
              <h3 className="card-title">
                Projects {pagination ? `(${pagination.total})` : `(${projects.length})`}
              </h3>
              <p className="text-sm text-gray-600">Manage projects</p>
            </div>

            <Button size="sm" onClick={handleAddProject}>
              <KeenIcon icon="plus" className="me-2" />
              Add Project
            </Button>
          </div>
        </div>

        <div className="card-body">
          {/* Error State */}
          {isError && (
            <Alert variant="danger" className="mb-4">
              <div className="flex items-center justify-between">
                <span>
                  {error?.message || 'Failed to load projects. Please try again.'}
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

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && !isFetching ? (
            <div className="p-8">
              <ContentLoader />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <KeenIcon icon="category" className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">No projects found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              {/* Projects Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead className="w-[50px]">Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project, index) => {
                      const displayOrder = project.displayOrder ?? (index + 1);
                      const imageUrl = project.image_url || project.imageUrl || project.icon_url || project.image;
                      const fullImageUrl = getImageUrl(imageUrl);

                      return (
                        <TableRow key={project.id}>
                          <TableCell>
                            {fullImageUrl ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img
                                  src={fullImageUrl}
                                  alt={project.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                <KeenIcon icon="image" className="text-gray-400 text-lg" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={displayOrder.toString()}
                              onValueChange={(value) => handleUpdateDisplayOrder(project.id, parseInt(value))}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: Math.max(pagination?.total || projects.length, projects.length) }, (_, index) => (
                                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                                    {index + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{project.name || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 max-w-md truncate">
                              {project.description || '—'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(project.status || ((project as any).is_active === false ? 'inactive' : 'active'))}
                              <Switch
                                checked={project.status === 'active' || ((project as any).is_active !== false && project.status !== 'inactive')}
                                onCheckedChange={(checked) => handleToggleStatus(project.id, checked)}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-shrink-0">
                                  <KeenIcon icon="dots-vertical" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(project)}>
                                  <KeenIcon icon="eye" className="me-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditProject(project)}>
                                  <KeenIcon icon="pencil" className="me-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(project.id)}
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

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} projects
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
              )}
            </>
          )}
        </div>
      </div>

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
          refetch(); // Refetch projects when form closes
        }}
        onSave={handleSaveProject}
        projectData={editingProject}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="trash" className="text-danger" />
              Delete Project
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the project <strong className="text-black">"{projectToDelete ? projects.find(p => p.id === projectToDelete)?.name || 'this project' : 'this project'}"</strong>?
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

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="category" className="text-primary" />
              {viewingProject?.name || 'Project Details'}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {viewingProject && (
              <div className="mt-4">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Project Image - Left Side */}
                  <div className="flex-shrink-0">
                    {(() => {
                      const imageUrl = viewingProject.image_url || viewingProject.imageUrl || viewingProject.icon_url || viewingProject.image;
                      const fullImageUrl = getImageUrl(imageUrl);
                      return fullImageUrl ? (
                        <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={fullImageUrl}
                            alt={viewingProject.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <KeenIcon icon="image" className="text-gray-400 text-4xl" />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Project Details - Right Side */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Project Name</div>
                        <div className="text-sm font-medium">{viewingProject.name || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                        <div>{getStatusBadge(viewingProject.status || ((viewingProject as any).is_active === false ? 'inactive' : 'active'))}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Display Order</div>
                        <div className="text-sm">
                          {viewingProject.displayOrder ?? 'N/A'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Project ID</div>
                        <div className="text-sm">{viewingProject.id || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Description */}
                    {viewingProject.description && (
                      <div className="space-y-1 pt-4 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{viewingProject.description}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ProjectManagement };
