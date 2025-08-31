export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  avatar?: string;
  isActive: boolean;
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: Date;
  endDate: Date;
  type: 'vacation' | 'sick' | 'personal' | 'holiday';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'vacation' | 'sick' | 'personal' | 'holiday';
  employeeId: string;
  employeeName: string;
  status: 'pending' | 'approved' | 'rejected';
  color?: string;
}

export interface CalendarView {
  type: 'month' | 'week' | 'year';
  currentDate: Date;
}

export interface FilterOptions {
  department?: string;
  employee?: string;
  status?: string;
  type?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportData {
  format: 'json' | 'csv' | 'ical' | 'confluence' | 'jira';
  data: VacationRequest[] | CalendarEvent[];
  filename: string;
}

export interface AppState {
  currentUser: TeamMember | null;
  teamMembers: TeamMember[];
  vacationRequests: VacationRequest[];
  calendarView: CalendarView;
  filters: FilterOptions;
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: TeamMember | null;
  token?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface VacationStats {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
  year: number;
}

export interface CompanyHoliday {
  id: string;
  name: string;
  date: Date;
  type: 'national' | 'company' | 'floating';
  isRecurring: boolean;
}