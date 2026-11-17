import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Calendar } from './components/Calendar';
import { VacationRequestForm } from './components/VacationRequestForm';
import { FilterPanel } from './components/FilterPanel';
import { Navigation } from './components/Navigation';
import { Login } from './components/Login';
import { ApprovalWorkflow } from './components/ApprovalWorkflow';
import { UserManagement } from './components/UserManagement';
import { RequestManagement } from './components/RequestManagement';
import { ProfileSettings } from './components/ProfileSettings';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { TeamManagement } from './components/TeamManagement';
import { NotificationSystem } from './components/NotificationSystem';
import type { VacationRequest, CalendarEvent, FilterOptions, TeamMember } from './types';
import { vacationUtils } from './utils/dateUtils';
import { exportUtils } from './utils/exportUtils';
import { sampleTeamMembers, sampleVacationRequests } from './data/mockData';
import './App.css';

// Main App Component
function AppContent() {
  const { isAuthenticated, user, addNotification } = useAuth();
  const [currentPage, setCurrentPage] = useState('calendar');
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(sampleVacationRequests);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(sampleTeamMembers);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  // Show login if not authenticated
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  // Convert vacation requests to calendar events
  const calendarEvents: CalendarEvent[] = vacationUtils.requestsToEvents(vacationRequests);

  // Filter events based on current filters
  const filteredEvents = calendarEvents.filter(event => {
    if (filters.employee && event.employeeId !== filters.employee) {
      return false;
    }
    if (filters.status && event.status !== filters.status) {
      return false;
    }
    if (filters.type && event.type !== filters.type) {
      return false;
    }
    if (filters.dateRange) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const filterStart = filters.dateRange.start;
      const filterEnd = filters.dateRange.end;
      
      const overlaps = eventStart <= filterEnd && eventEnd >= filterStart;
      if (!overlaps) {
        return false;
      }
    }
    return true;
  });

  const handleNewRequest = (date?: Date) => {
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (requestData: Omit<VacationRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequest: VacationRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (selectedEvent) {
      setVacationRequests(prev => 
        prev.map(req => 
          req.id === selectedEvent.id 
            ? { ...newRequest, id: selectedEvent.id }
            : req
        )
      );
      
      // Add notification for request update
      addNotification({
        type: 'info',
        title: 'Vacation Request Updated',
        message: `Your vacation request has been updated and is pending approval.`,
        isRead: false
      });
    } else {
      setVacationRequests(prev => [...prev, newRequest]);
      
      // Add notification for new request
      addNotification({
        type: 'success',
        title: 'Vacation Request Submitted',
        message: `Your vacation request from ${requestData.startDate.toLocaleDateString()} to ${requestData.endDate.toLocaleDateString()} has been submitted for approval.`,
        isRead: false,
        actionText: 'View Requests',
        actionUrl: '/requests'
      });
    }
  };

  const handleApproveRequest = (requestId: string, comments?: string) => {
    const request = vacationRequests.find(req => req.id === requestId);
    if (request) {
      setVacationRequests(prev => 
        prev.map(req => 
          req.id === requestId
            ? { 
                ...req, 
                status: 'approved',
                approvedBy: user?.name,
                approvedAt: new Date(),
                approvalComments: comments,
                updatedAt: new Date()
              }
            : req
        )
      );
      
      // Add notification for the requester
      addNotification({
        type: 'success',
        title: 'Vacation Request Approved',
        message: `Your vacation request from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()} has been approved by ${user?.name}.`,
        isRead: false,
        actionText: 'View Calendar',
        actionUrl: '/calendar'
      });
      
      // Add notification for the approver
      addNotification({
        type: 'info',
        title: 'Request Approved',
        message: `You approved ${request.employeeName}'s vacation request.`,
        isRead: false
      });
    }
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    const request = vacationRequests.find(req => req.id === requestId);
    if (request) {
      setVacationRequests(prev => 
        prev.map(req => 
          req.id === requestId
            ? { 
                ...req, 
                status: 'rejected',
                rejectedBy: user?.name,
                rejectedAt: new Date(),
                rejectionReason: reason,
                updatedAt: new Date()
              }
            : req
        )
      );
      
      // Add notification for the requester
      addNotification({
        type: 'error',
        title: 'Vacation Request Rejected',
        message: `Your vacation request from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()} has been rejected by ${user?.name}. Reason: ${reason}`,
        isRead: false,
        actionText: 'Submit New Request',
        actionUrl: '/calendar'
      });
      
      // Add notification for the rejector
      addNotification({
        type: 'info',
        title: 'Request Rejected',
        message: `You rejected ${request.employeeName}'s vacation request.`,
        isRead: false
      });
    }
  };

  const handleUpdateRequest = (request: VacationRequest) => {
    setVacationRequests(prev => 
      prev.map(req => req.id === request.id ? request : req)
    );
  };

  const handleDeleteRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      setVacationRequests(prev => prev.filter(req => req.id !== requestId));
    }
  };

  const handleEditRequest = (request: VacationRequest) => {
    const foundRequest = vacationRequests.find(req => req.id === request.id);
    if (foundRequest) {
      setSelectedEvent({
        id: foundRequest.id,
        title: `${foundRequest.employeeName} - ${foundRequest.type}`,
        start: foundRequest.startDate,
        end: foundRequest.endDate,
        type: foundRequest.type,
        status: foundRequest.status,
        employeeId: foundRequest.employeeId,
        employeeName: foundRequest.employeeName
      });
      setIsFormOpen(true);
    }
  };

  const handleExport = (format: string) => {
    const filteredRequests = vacationUtils.filterVacationRequests(vacationRequests, filters);
    
    let exportData;
    switch (format) {
      case 'csv':
        exportData = exportUtils.toCSV(filteredRequests);
        break;
      case 'json':
        exportData = exportUtils.toJSON(filteredRequests);
        break;
      case 'ical':
        exportData = exportUtils.toICal(filteredEvents);
        break;
      case 'confluence':
        exportData = exportUtils.toConfluence(filteredRequests);
        break;
      case 'jira':
        exportData = exportUtils.toJira(filteredRequests);
        break;
      default:
        return;
    }
    
    exportUtils.downloadFile(exportData);
  };

  const handleDateClick = (date: Date) => {
    handleNewRequest(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'calendar':
        return (
          <div className="main-layout">
            <aside className="sidebar">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                teamMembers={teamMembers}
                onExport={handleExport}
                onNewRequest={() => handleNewRequest()}
              />
            </aside>
            <div className="calendar-container">
              <Calendar
                events={filteredEvents}
                filters={filters}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            </div>
          </div>
        );
      case 'requests':
        return (
          <div className="page-content">
            <ApprovalWorkflow
              requests={vacationRequests}
              teamMembers={teamMembers}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onUpdateRequest={handleUpdateRequest}
            />
          </div>
        );
      case 'team':
        return (
          <div className="page-content">
            <TeamManagement
              teamMembers={teamMembers}
              onUpdateTeamMembers={setTeamMembers}
            />
          </div>
        );
      case 'requests-mgmt':
        return (
          <div className="page-content">
            <RequestManagement
              requests={vacationRequests}
              teamMembers={teamMembers}
              onUpdateRequest={handleUpdateRequest}
              onDeleteRequest={handleDeleteRequest}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onEditRequest={handleEditRequest}
            />
          </div>
        );
      case 'reports':
        return (
          <div className="page-content">
            <ReportsAnalytics
              requests={vacationRequests}
              teamMembers={teamMembers}
            />
          </div>
        );
      case 'admin':
        return (
          <div className="page-content">
            <UserManagement
              teamMembers={teamMembers}
              onUpdateTeamMembers={setTeamMembers}
            />
          </div>
        );
      case 'profile':
        return (
          <div className="page-content">
            <ProfileSettings
              teamMembers={teamMembers}
              onUpdateTeamMembers={setTeamMembers}
            />
          </div>
        );
      default:
        return (
          <div className="main-layout">
            <aside className="sidebar">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                teamMembers={teamMembers}
                onExport={handleExport}
                onNewRequest={() => handleNewRequest()}
              />
            </aside>
            <div className="calendar-container">
              <Calendar
                events={filteredEvents}
                filters={filters}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="app-main">
        {renderCurrentPage()}
      </main>

      <VacationRequestForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        currentUser={user}
        initialDate={selectedDate}
        existingRequest={selectedEvent ? vacationRequests.find(req => req.id === selectedEvent.id) : undefined}
      />
      
      <NotificationSystem position="top-right" maxNotifications={5} autoHideDelay={5000} />
    </div>
  );
}

// Root App with Auth Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
