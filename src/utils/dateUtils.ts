import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  isWeekend,
  differenceInDays,
  isWithinInterval
} from 'date-fns';
import type { CalendarEvent, VacationRequest, FilterOptions } from '../types';

export const dateUtils = {
  // Format date for display
  formatDate: (date: Date, formatStr: string = 'yyyy-MM-dd') => {
    return format(date, formatStr);
  },

  // Get calendar days for month view
  getMonthDays: (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  },

  // Get week days for week view
  getWeekDays: (date: Date) => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);

    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  },

  // Check if date is in current month
  isCurrentMonth: (date: Date, currentDate: Date) => {
    return isSameMonth(date, currentDate);
  },

  // Check if date is today
  isToday: (date: Date) => {
    return isSameDay(date, new Date());
  },

  // Navigate calendar
  navigateMonth: (date: Date, direction: 'next' | 'prev') => {
    return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
  },

  navigateWeek: (date: Date, direction: 'next' | 'prev') => {
    return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
  },

  // Check if date is weekend
  isWeekend: (date: Date) => {
    return isWeekend(date);
  },

  // Calculate vacation duration
  getVacationDuration: (startDate: Date, endDate: Date) => {
    return differenceInDays(endDate, startDate) + 1;
  },

  // Check if date is within vacation period
  isDateInVacation: (date: Date, startDate: Date, endDate: Date) => {
    return isWithinInterval(date, { start: startDate, end: endDate });
  }
};

export const vacationUtils = {
  // Filter vacation requests
  filterVacationRequests: (requests: VacationRequest[], filters: FilterOptions) => {
    return requests.filter(request => {
      if (filters.department && request.employeeId) {
        // In a real app, you'd match against employee's department
        // For now, we'll skip this filter
      }

      if (filters.employee && request.employeeId !== filters.employee) {
        return false;
      }

      if (filters.status && request.status !== filters.status) {
        return false;
      }

      if (filters.type && request.type !== filters.type) {
        return false;
      }

      if (filters.dateRange) {
        const requestStart = new Date(request.startDate);
        const requestEnd = new Date(request.endDate);
        const filterStart = filters.dateRange.start;
        const filterEnd = filters.dateRange.end;

        // Check if vacation overlaps with filter date range
        const overlaps = requestStart <= filterEnd && requestEnd >= filterStart;
        if (!overlaps) {
          return false;
        }
      }

      return true;
    });
  },

  // Convert vacation requests to calendar events
  requestsToEvents: (requests: VacationRequest[]): CalendarEvent[] => {
    return requests.map(request => ({
      id: request.id,
      title: `${request.employeeName} - ${request.type}`,
      start: new Date(request.startDate),
      end: new Date(request.endDate),
      type: request.type,
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      status: request.status,
      color: getStatusColor(request.status)
    }));
  },

  // Get events for a specific date
  getEventsForDate: (events: CalendarEvent[], date: Date) => {
    return events.filter(event => 
      dateUtils.isDateInVacation(date, event.start, event.end)
    );
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'approved':
      return '#10b981'; // green
    case 'pending':
      return '#f59e0b'; // yellow
    case 'rejected':
      return '#ef4444'; // red
    case 'cancelled':
      return '#6b7280'; // gray
    default:
      return '#3b82f6'; // blue
  }
};

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'vacation':
      return '#3b82f6'; // blue
    case 'sick':
      return '#ef4444'; // red
    case 'personal':
      return '#8b5cf6'; // purple
    case 'holiday':
      return '#10b981'; // green
    default:
      return '#6b7280'; // gray
  }
};

export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const start = format(startDate, 'MMM d');
  const end = format(endDate, 'MMM d, yyyy');
  
  if (isSameDay(startDate, endDate)) {
    return format(startDate, 'MMM d, yyyy');
  }
  
  return `${start} - ${end}`;
};