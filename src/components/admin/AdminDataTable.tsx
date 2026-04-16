import { ReactNode } from 'react';
import { Table } from '@/components/ui/table';

interface AdminDataTableProps {
  children: ReactNode;
  className?: string;
}

const AdminDataTable = ({ children, className }: AdminDataTableProps) => {
  return (
    <Table className={className || 'min-w-full'} containerClassName="max-h-[65vh] overflow-auto">
      {children}
    </Table>
  );
};

export { AdminDataTable };
