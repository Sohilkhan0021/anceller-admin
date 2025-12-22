import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ISupportTicket {
  id: string;
  ticketId: string;
  user: string;
  userEmail: string;
  issue: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  createdAt: string;
  lastUpdated: string;
}

interface ISupportTicketsProps {
  onCreateTicket?: () => void;
}

const SupportTickets = ({ onCreateTicket }: ISupportTicketsProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ISupportTicket | null>(null);
  const [response, setResponse] = useState('');

  // Mock data - in real app, this would come from API
  const supportTickets: ISupportTicket[] = [
    {
      id: 'TKT001',
      ticketId: 'T-2024-001',
      user: 'John Doe',
      userEmail: 'john@example.com',
      issue: 'Payment not processed',
      description: 'My payment of ₹500 was deducted but booking was not confirmed',
      status: 'open',
      priority: 'high',
      assignedTo: 'Support Team',
      createdAt: '2024-01-20 10:30 AM',
      lastUpdated: '2024-01-20 10:30 AM'
    },
    {
      id: 'TKT002',
      ticketId: 'T-2024-002',
      user: 'Jane Smith',
      userEmail: 'jane@example.com',
      issue: 'Provider not responding',
      description: 'My assigned provider is not responding to calls',
      status: 'in-progress',
      priority: 'medium',
      assignedTo: 'Support Team',
      createdAt: '2024-01-20 09:15 AM',
      lastUpdated: '2024-01-20 11:45 AM'
    },
    {
      id: 'TKT003',
      ticketId: 'T-2024-003',
      user: 'Mike Johnson',
      userEmail: 'mike@example.com',
      issue: 'Refund request',
      description: 'I want to cancel my booking and get a refund',
      status: 'resolved',
      priority: 'medium',
      assignedTo: 'Finance Team',
      createdAt: '2024-01-19 2:30 PM',
      lastUpdated: '2024-01-20 9:00 AM'
    },
    {
      id: 'TKT004',
      ticketId: 'T-2024-004',
      user: 'Sarah Wilson',
      userEmail: 'sarah@example.com',
      issue: 'App not working',
      description: 'The app keeps crashing when I try to book a service',
      status: 'open',
      priority: 'urgent',
      assignedTo: 'Tech Team',
      createdAt: '2024-01-20 1:20 PM',
      lastUpdated: '2024-01-20 1:20 PM'
    },
    {
      id: 'TKT005',
      ticketId: 'T-2024-005',
      user: 'David Brown',
      userEmail: 'david@example.com',
      issue: 'Service quality issue',
      description: 'The service provided was not satisfactory',
      status: 'closed',
      priority: 'low',
      assignedTo: 'Operations Team',
      createdAt: '2024-01-18 4:45 PM',
      lastUpdated: '2024-01-19 3:30 PM'
    }
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // TODO: Implement search functionality
  };

  const handleRespond = (ticket: ISupportTicket) => {
    setSelectedTicket(ticket);
    setResponse('');
    setIsResponseOpen(true);
  };

  const handleCloseTicket = (ticketId: string) => {
    // TODO: Implement close ticket functionality
    console.log('Closing ticket:', ticketId);
  };

  const handleEscalateTicket = (ticketId: string) => {
    // TODO: Implement escalate ticket functionality
    console.log('Escalating ticket:', ticketId);
  };

  const handleSendResponse = () => {
    // TODO: Implement send response functionality
    console.log('Sending response:', response);
    setIsResponseOpen(false);
    setSelectedTicket(null);
    setResponse('');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'default', className: 'bg-warning text-white', text: 'Open' },
      'in-progress': { variant: 'default', className: 'bg-info text-white', text: 'In Progress' },
      resolved: { variant: 'default', className: 'bg-success text-white', text: 'Resolved' },
      closed: { variant: 'secondary', className: '', text: 'Closed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'secondary', className: '', text: 'Low' },
      medium: { variant: 'default', className: 'bg-info text-white', text: 'Medium' },
      high: { variant: 'default', className: 'bg-warning text-white', text: 'High' },
      urgent: { variant: 'destructive', className: '', text: 'Urgent' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { variant: 'secondary', className: '', text: priority };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="card">
      <div className="card-header">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="card-title">Support Tickets ({filteredTickets.length})</h3>
            <p className="text-sm text-gray-600">Manage customer support requests</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <KeenIcon icon="file-down" className="me-2" />
              Export Tickets
            </Button>
            <Button size="sm" onClick={onCreateTicket}>
              <KeenIcon icon="plus" className="me-2" />
              New Ticket
            </Button>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <KeenIcon icon="magnifier" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by ticket ID, user, or issue..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell w-[120px]">Ticket ID</TableHead>
                <TableHead className="w-[200px] sm:w-[250px]">User</TableHead>
                <TableHead className="hidden md:table-cell w-[150px]">Issue</TableHead>
                <TableHead className="hidden lg:table-cell w-[100px]">Priority</TableHead>
                <TableHead className="hidden md:table-cell w-[100px]">Status</TableHead>
                <TableHead className="hidden lg:table-cell w-[120px]">Assigned To</TableHead>
                <TableHead className="min-w-[200px] w-auto">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="hidden sm:table-cell w-[120px]">
                    <div className="font-medium text-sm">{ticket.ticketId}</div>
                    <div className="text-xs text-gray-500">{ticket.createdAt}</div>
                  </TableCell>
                  <TableCell className="w-[200px] sm:w-[250px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                        <KeenIcon icon="user" className="text-primary text-xs" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate text-sm">{ticket.user}</div>
                        <div className="text-xs text-gray-500 hidden sm:block">{ticket.userEmail}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{ticket.ticketId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell w-[150px]">
                    <div className="max-w-xs">
                      <div className="truncate text-sm" title={ticket.issue}>
                        {ticket.issue}
                      </div>
                      <div className="text-xs text-gray-500 truncate" title={ticket.description}>
                        {ticket.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell w-[100px]">{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell className="hidden md:table-cell w-[100px]">{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="hidden lg:table-cell w-[120px]">
                    <div className="text-sm">
                      <div className="font-medium">{ticket.assignedTo}</div>
                      <div className="text-gray-500">{ticket.lastUpdated}</div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[200px] w-auto">
                    <div className="flex items-center justify-end">
                      <div className="flex flex-col gap-1 sm:hidden mr-1">
                        <div className="lg:hidden">
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <div className="md:hidden">
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                      <div className="flex flex-nowrap gap-1.5 items-center">
                        <Button size="sm" variant="outline" onClick={() => handleRespond(ticket)} className="text-xs whitespace-nowrap flex-shrink-0">
                          <KeenIcon icon="rocket" className="me-1" />
                          <span className="hidden sm:inline whitespace-nowrap">Respond</span>
                        </Button>
                        {ticket.status === 'open' && (
                          <Button size="sm" variant="outline" onClick={() => handleCloseTicket(ticket.id)} className="text-xs whitespace-nowrap flex-shrink-0">
                            <KeenIcon icon="cross" className="me-1" />
                            <span className="hidden sm:inline whitespace-nowrap">Close</span>
                          </Button>
                        )}
                        {ticket.priority !== 'urgent' && (
                          <Button size="sm" variant="outline" onClick={() => handleEscalateTicket(ticket.id)} className="text-xs whitespace-nowrap flex-shrink-0">
                            <KeenIcon icon="arrow-up" className="me-1" />
                            <span className="hidden sm:inline whitespace-nowrap">Escalate</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Response Modal */}
      <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="flex items-center gap-3">
              <KeenIcon icon="message" className="text-primary" />
              Respond to {selectedTicket?.ticketId}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="px-6 pb-6">
            <div className="space-y-6">
            <div>
              <Label htmlFor="response">Response</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="mt-2"
                placeholder="Enter your response to the customer..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsResponseOpen(false)}>
                <KeenIcon icon="cross" className="me-2" />
                Cancel
              </Button>
              <Button onClick={handleSendResponse}>
                <KeenIcon icon="rocket" className="me-2" />
                Send Response
              </Button>
            </div>
          </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { SupportTickets };

