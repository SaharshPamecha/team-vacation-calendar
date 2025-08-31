export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  avatar?: string;
  isActive: boolean;
  managerId?: string;
  managerName?: string;
  jobTitle?: string;
  hireDate?: Date;
  annualLeaveEntitlement?: number;
  remainingLeave?: number;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
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
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  attachments?: string[];
  workingDays?: number;
  isEmergency?: boolean;
  managerComments?: string;
  hrComments?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'vacation' | 'sick' | 'personal' | 'holiday';
  employeeId: string;
  employeeName: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
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

// New interfaces for enhanced functionality
export interface Department {
  id: string;
  name: string;
  managerId: string;
  managerName: string;
  description?: string;
  maxConcurrentLeave: number;
  isActive: boolean;
}

export interface ApprovalWorkflow {
  id: string;
  requestId: string;
  stepNumber: number;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  actionDate?: Date;
  isRequired: boolean;
}

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  category: 'calendar' | 'requests' | 'users' | 'reports' | 'settings';
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: UserPermission[];
  isSystemRole: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface SystemSettings {
  companyName: string;
  timeZone: string;
  workingDays: number[];
  defaultVacationDays: number;
  maxAdvanceBookingDays: number;
  minNoticeHours: number;
  allowWeekendRequests: boolean;
  requireManagerApproval: boolean;
  requireHRApproval: boolean;
  emailNotifications: boolean;
  slackIntegration: boolean;
  confluenceIntegration: boolean;
  jiraIntegration: boolean;
}

export interface DashboardStats {
  totalEmployees: number;
  activeRequests: number;
  pendingApprovals: number;
  upcomingVacations: number;
  thisMonthRequests: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  averageRequestDays: number;
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflictType: 'department_limit' | 'blackout_period' | 'holiday' | 'manager_unavailable';
  conflictDetails: string;
  affectedEmployees?: string[];
  suggestion?: string;
}