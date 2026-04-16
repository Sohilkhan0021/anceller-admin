import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeenIcon } from '@/components';

interface IServiceAreaManagementHeaderProps {
  onCreate: () => void;
  search: string;
  // eslint-disable-next-line no-unused-vars
  onSearchChange: (_value: string) => void;
}

const ServiceAreaManagementHeader = ({
  onCreate,
  search,
  onSearchChange
}: IServiceAreaManagementHeaderProps) => {
  return (
    <div className="card">
      <div className="card-body flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h3 className="card-title">Service Areas</h3>
          <p className="text-sm text-muted-foreground">
            Manage cities / zones where providers can receive jobs.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative">
            <KeenIcon
              icon="magnifier"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 text-sm"
            />
            <Input
              className="pl-9 w-full md:w-64"
              placeholder="Search by name or city"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button onClick={onCreate} className="whitespace-nowrap">
            <KeenIcon icon="plus" className="me-2" />
            Add Service Area
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ServiceAreaManagementHeader };
