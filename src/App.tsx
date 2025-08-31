import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Calendar } from './components/Calendar';
import { VacationRequestForm } from './components/VacationRequestForm';
import { FilterPanel } from './components/FilterPanel';
import { Navigation } from './components/Navigation';
import { Login } from './components/Login';
import type { VacationRequest, CalendarEvent, FilterOptions, TeamMember } from './types';
import { vacationUtils } from './utils/dateUtils';
import { exportUtils } from './utils/exportUtils';
import { sampleTeamMembers, sampleVacationRequests } from './data/mockData';
import './App.css';

// Main App Component
function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('calendar');
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(sampleVacationRequests);
  const [teamMembers] = useState<TeamMember[]>(sampleTeamMembers);
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
    } else {
      setVacationRequests(prev => [...prev, newRequest]);
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
        return <div className="page-content">Requests Management - Coming Soon</div>;
      case 'team':
        return <div className="page-content">Team Management - Coming Soon</div>;
      case 'reports':
        return <div className="page-content">Reports & Analytics - Coming Soon</div>;
      case 'admin':
        return <div className="page-content">Admin Panel - Coming Soon</div>;
      case 'profile':
        return <div className="page-content">Profile Settings - Coming Soon</div>;
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
