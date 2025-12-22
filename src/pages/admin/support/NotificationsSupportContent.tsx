import { useState } from 'react';
import { NotificationsSupportHeader } from './blocks/NotificationsSupportHeader';
import { SupportTickets } from './blocks/SupportTickets';
import { Announcements } from './blocks/Announcements';
import { CreateTicketForm } from './forms/CreateTicketForm';
import { AddUserForm } from './forms/AddUserForm';

const NotificationsSupportContent = () => {
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);

  const handleCreateTicket = () => {
    setIsCreateTicketOpen(true);
  };

  const handleAddUser = () => {
    setIsAddUserOpen(true);
  };

  const handleCreateAnnouncement = () => {
    setIsCreateAnnouncementOpen(true);
  };

  const handleCloseCreateTicket = () => {
    setIsCreateTicketOpen(false);
  };

  const handleCloseAddUser = () => {
    setIsAddUserOpen(false);
  };

  const handleCloseCreateAnnouncement = () => {
    setIsCreateAnnouncementOpen(false);
  };

  const handleSaveTicket = (ticketData: any) => {
    console.log('Saving ticket:', ticketData);
    // TODO: Implement API call to save ticket
    setIsCreateTicketOpen(false);
  };

  const handleSaveUser = (userData: any) => {
    console.log('Saving user:', userData);
    // TODO: Implement API call to save user
    setIsAddUserOpen(false);
  };

  const handleSaveAnnouncement = (announcementData: any) => {
    console.log('Saving announcement:', announcementData);
    // TODO: Implement API call to save announcement
    setIsCreateAnnouncementOpen(false);
    // Reset form data in Announcements component
    // This will be handled by the component's internal state reset
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Header */}
      <NotificationsSupportHeader 
        onCreateTicket={handleCreateTicket}
        onAddUser={handleAddUser}
        onCreateAnnouncement={handleCreateAnnouncement}
      />

      {/* Support Tickets */}
      <SupportTickets onCreateTicket={handleCreateTicket} />

      {/* Announcements */}
      <Announcements 
        onCreateAnnouncement={handleCreateAnnouncement}
        isCreateModalOpen={isCreateAnnouncementOpen}
        onCloseCreateModal={handleCloseCreateAnnouncement}
        onSaveAnnouncement={handleSaveAnnouncement}
      />

      {/* Create Ticket Form */}
      <CreateTicketForm 
        isOpen={isCreateTicketOpen}
        onClose={handleCloseCreateTicket}
        onSave={handleSaveTicket}
      />

      {/* Add User Form */}
      <AddUserForm 
        isOpen={isAddUserOpen}
        onClose={handleCloseAddUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export { NotificationsSupportContent };


