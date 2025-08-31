import type { TeamMember, VacationRequest, CompanyHoliday } from '../types';

export const sampleTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'admin',
    department: 'Engineering',
    isActive: true,
    jobTitle: 'Engineering Director',
    hireDate: new Date('2020-01-15'),
    annualLeaveEntitlement: 25,
    remainingLeave: 18,
    phone: '+1-555-0101'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'manager',
    department: 'Engineering',
    managerId: '1',
    managerName: 'John Smith',
    isActive: true,
    jobTitle: 'Senior Software Engineer',
    hireDate: new Date('2021-03-10'),
    annualLeaveEntitlement: 22,
    remainingLeave: 15,
    phone: '+1-555-0102'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'employee',
    department: 'Engineering',
    managerId: '2',
    managerName: 'Sarah Johnson',
    isActive: true,
    jobTitle: 'Software Engineer',
    hireDate: new Date('2022-06-01'),
    annualLeaveEntitlement: 20,
    remainingLeave: 12,
    phone: '+1-555-0103'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'employee',
    department: 'Design',
    managerId: '6',
    managerName: 'Lisa Anderson',
    isActive: true,
    jobTitle: 'UX Designer',
    hireDate: new Date('2022-02-14'),
    annualLeaveEntitlement: 20,
    remainingLeave: 16,
    phone: '+1-555-0104'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'employee',
    department: 'Marketing',
    managerId: '6',
    managerName: 'Lisa Anderson',
    isActive: true,
    jobTitle: 'Marketing Specialist',
    hireDate: new Date('2023-01-08'),
    annualLeaveEntitlement: 18,
    remainingLeave: 14,
    phone: '+1-555-0105'
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    role: 'manager',
    department: 'HR',
    managerId: '1',
    managerName: 'John Smith',
    isActive: true,
    jobTitle: 'HR Manager',
    hireDate: new Date('2019-11-20'),
    annualLeaveEntitlement: 24,
    remainingLeave: 19,
    phone: '+1-555-0106'
  }
];

export const sampleVacationRequests: VacationRequest[] = [
  {
    id: '1',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    startDate: new Date('2025-09-15'),
    endDate: new Date('2025-09-19'),
    type: 'vacation',
    status: 'approved',
    reason: 'Family vacation to Hawaii',
    approvedBy: 'John Smith',
    approvedAt: new Date('2025-08-15'),
    createdAt: new Date('2025-08-10'),
    updatedAt: new Date('2025-08-15')
  },
  {
    id: '2',
    employeeId: '3',
    employeeName: 'Mike Chen',
    startDate: new Date('2025-09-22'),
    endDate: new Date('2025-09-24'),
    type: 'personal',
    status: 'pending',
    reason: 'Moving to new apartment',
    createdAt: new Date('2025-08-25'),
    updatedAt: new Date('2025-08-25')
  },
  {
    id: '3',
    employeeId: '4',
    employeeName: 'Emily Davis',
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-10-03'),
    type: 'sick',
    status: 'approved',
    reason: 'Medical appointment',
    approvedBy: 'Sarah Johnson',
    approvedAt: new Date('2025-09-01'),
    createdAt: new Date('2025-08-30'),
    updatedAt: new Date('2025-09-01')
  },
  {
    id: '4',
    employeeId: '5',
    employeeName: 'David Wilson',
    startDate: new Date('2025-10-15'),
    endDate: new Date('2025-10-25'),
    type: 'vacation',
    status: 'pending',
    reason: 'Europe trip',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-01')
  },
  {
    id: '5',
    employeeId: '6',
    employeeName: 'Lisa Anderson',
    startDate: new Date('2025-11-28'),
    endDate: new Date('2025-11-29'),
    type: 'vacation',
    status: 'approved',
    reason: 'Thanksgiving break',
    approvedBy: 'John Smith',
    approvedAt: new Date('2025-09-01'),
    createdAt: new Date('2025-08-20'),
    updatedAt: new Date('2025-09-01')
  },
  {
    id: '6',
    employeeId: '1',
    employeeName: 'John Smith',
    startDate: new Date('2025-12-23'),
    endDate: new Date('2025-12-30'),
    type: 'vacation',
    status: 'approved',
    reason: 'Christmas holidays',
    approvedBy: 'John Smith',
    approvedAt: new Date('2025-09-01'),
    createdAt: new Date('2025-08-15'),
    updatedAt: new Date('2025-09-01')
  }
];

export const sampleCompanyHolidays: CompanyHoliday[] = [
  {
    id: 'holiday-1',
    name: 'New Year\'s Day',
    date: new Date('2025-01-01'),
    type: 'national',
    isRecurring: true
  },
  {
    id: 'holiday-2',
    name: 'Memorial Day',
    date: new Date('2025-05-26'),
    type: 'national',
    isRecurring: true
  },
  {
    id: 'holiday-3',
    name: 'Independence Day',
    date: new Date('2025-07-04'),
    type: 'national',
    isRecurring: true
  },
  {
    id: 'holiday-4',
    name: 'Labor Day',
    date: new Date('2025-09-01'),
    type: 'national',
    isRecurring: true
  },
  {
    id: 'holiday-5',
    name: 'Thanksgiving',
    date: new Date('2025-11-27'),
    type: 'national',
    isRecurring: true
  },
  {
    id: 'holiday-6',
    name: 'Christmas Day',
    date: new Date('2025-12-25'),
    type: 'national',
    isRecurring: true
  },
  {
    id: 'holiday-7',
    name: 'Company Retreat Day',
    date: new Date('2025-06-15'),
    type: 'company',
    isRecurring: false
  }
];

// Utility function to get current user (for demo purposes)
export const getCurrentUser = (): TeamMember => {
  return sampleTeamMembers[0]; // John Smith as default admin user
};

// Utility function to generate mock vacation stats
export const getMockVacationStats = (employeeId: string, year: number = 2025) => {
  const employeeRequests = sampleVacationRequests.filter(
    req => req.employeeId === employeeId && new Date(req.startDate).getFullYear() === year
  );

  const usedDays = employeeRequests
    .filter(req => req.status === 'approved')
    .reduce((total, req) => {
      const days = Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);

  const pendingDays = employeeRequests
    .filter(req => req.status === 'pending')
    .reduce((total, req) => {
      const days = Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);

  const totalDays = 25; // Standard vacation allowance

  return {
    totalDays,
    usedDays,
    remainingDays: totalDays - usedDays,
    pendingDays,
    year
  };
};