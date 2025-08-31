import React, { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { VacationRequestForm } from './components/VacationRequestForm';
import { FilterPanel } from './components/FilterPanel';
import type { VacationRequest, CalendarEvent, FilterOptions, TeamMember } from './types';
import { vacationUtils, dateUtils } from './utils/dateUtils';
import { exportUtils } from './utils/exportUtils';
import { sampleTeamMembers, sampleVacationRequests, getCurrentUser } from './data/mockData';
import './App.css';

function App() {
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(sampleVacationRequests);
  const [teamMembers] = useState<TeamMember[]>(sampleTeamMembers);
  const [currentUser] = useState<TeamMember>(getCurrentUser());
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

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

  const handleEditRequest = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
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
      // Update existing request
      setVacationRequests(prev => 
        prev.map(req => 
          req.id === selectedEvent.id 
            ? { ...newRequest, id: selectedEvent.id }
            : req
        )
      );
    } else {
      // Add new request
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
    // For now, just show event details - could open edit form if user has permission
    console.log('Event clicked:', event);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Team Vacation Calendar</h1>
          <p className="app-subtitle">Manage team vacations and time off requests</p>
        </div>
      </header>

      <main className="app-main">
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
      </main>

      <VacationRequestForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        currentUser={currentUser}
        initialDate={selectedDate}
        existingRequest={selectedEvent ? vacationRequests.find(req => req.id === selectedEvent.id) : undefined}
      />
    </div>
  );
}

export default App
