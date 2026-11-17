import React, { useState, useMemo } from 'react';
import { BarChart, Users, Calendar, TrendingUp, Clock, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { VacationRequest, TeamMember } from '../types';
import styles from '../styles/ReportsAnalytics.module.css';

interface ReportsAnalyticsProps {
  requests: VacationRequest[];
  teamMembers: TeamMember[];
}

interface ChartData {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
}

interface DepartmentStats {
  department: string;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  pendingRequests: number;
  totalDays: number;
  averageDays: number;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  requests,
  teamMembers
}) => {
  const { user, hasPermission } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'3months' | '6months' | '1year'>('6months');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [reportView, setReportView] = useState<'overview' | 'departments' | 'trends' | 'employees'>('overview');

  // Check permissions
  if (!hasPermission('view_reports') && !hasPermission('view_team_reports')) {
    return (
      <div className={styles.noPermission}>
        <BarChart size={48} />
        <h3>Access Denied</h3>
        <p>You don't have permission to view reports and analytics.</p>
      </div>
    );
  }

  // Get unique departments
  const departments = useMemo(() => {
    const depts = Array.from(new Set(teamMembers.map(member => member.department)));
    return depts.filter(Boolean);
  }, [teamMembers]);

  // Filter requests based on permissions and time range
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Apply role-based filtering
    if (user?.role === 'manager') {
      const teamMemberIds = teamMembers
        .filter(member => member.managerId === user.id)
        .map(member => member.id);
      filtered = requests.filter(req => teamMemberIds.includes(req.employeeId));
    }

    // Apply department filter
    if (selectedDepartment !== 'all') {
      const departmentMemberIds = teamMembers
        .filter(member => member.department === selectedDepartment)
        .map(member => member.id);
      filtered = filtered.filter(req => departmentMemberIds.includes(req.employeeId));
    }

    // Apply time range filter
    const now = new Date();
    const cutoffDate = new Date();
    switch (selectedTimeRange) {
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return filtered.filter(req => new Date(req.createdAt) >= cutoffDate);
  }, [requests, teamMembers, user, selectedTimeRange, selectedDepartment]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalRequests = filteredRequests.length;
    const approvedRequests = filteredRequests.filter(req => req.status === 'approved').length;
    const rejectedRequests = filteredRequests.filter(req => req.status === 'rejected').length;
    const pendingRequests = filteredRequests.filter(req => req.status === 'pending').length;
    
    const totalDays = filteredRequests.reduce((sum, req) => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    const averageDays = totalRequests > 0 ? Math.round(totalDays / totalRequests * 10) / 10 : 0;
    const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0;

    return {
      totalRequests,
      approvedRequests,
      rejectedRequests,
      pendingRequests,
      totalDays,
      averageDays,
      approvalRate
    };
  }, [filteredRequests]);

  // Calculate monthly chart data
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: ChartData } = {};
    
    filteredRequests.forEach(req => {
      const month = new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { month, approved: 0, rejected: 0, pending: 0 };
      }
      
      monthlyData[month][req.status as keyof Omit<ChartData, 'month'>]++;
    });

    return Object.values(monthlyData).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  }, [filteredRequests]);

  // Calculate department statistics
  const departmentStats = useMemo(() => {
    const stats: { [key: string]: DepartmentStats } = {};

    departments.forEach(dept => {
      const deptMemberIds = teamMembers
        .filter(member => member.department === dept)
        .map(member => member.id);
      
      const deptRequests = filteredRequests.filter(req => 
        deptMemberIds.includes(req.employeeId)
      );

      const totalDays = deptRequests.reduce((sum, req) => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + days;
      }, 0);

      stats[dept] = {
        department: dept,
        totalRequests: deptRequests.length,
        approvedRequests: deptRequests.filter(req => req.status === 'approved').length,
        rejectedRequests: deptRequests.filter(req => req.status === 'rejected').length,
        pendingRequests: deptRequests.filter(req => req.status === 'pending').length,
        totalDays,
        averageDays: deptRequests.length > 0 ? Math.round(totalDays / deptRequests.length * 10) / 10 : 0
      };
    });

    return Object.values(stats);
  }, [departments, teamMembers, filteredRequests]);

  // Calculate employee statistics
  const employeeStats = useMemo(() => {
    return teamMembers.map(member => {
      const memberRequests = filteredRequests.filter(req => req.employeeId === member.id);
      const totalDays = memberRequests.reduce((sum, req) => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + days;
      }, 0);

      return {
        id: member.id,
        name: member.name,
        department: member.department,
        totalRequests: memberRequests.length,
        approvedRequests: memberRequests.filter(req => req.status === 'approved').length,
        rejectedRequests: memberRequests.filter(req => req.status === 'rejected').length,
        pendingRequests: memberRequests.filter(req => req.status === 'pending').length,
        totalDays,
        averageDays: memberRequests.length > 0 ? Math.round(totalDays / memberRequests.length * 10) / 10 : 0
      };
    }).filter(stat => stat.totalRequests > 0);
  }, [teamMembers, filteredRequests]);

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange: selectedTimeRange,
      department: selectedDepartment,
      overallStats,
      departmentStats,
      employeeStats: employeeStats.slice(0, 10) // Top 10 employees
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vacation-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderOverviewStats = () => (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <Calendar size={24} />
        </div>
        <div className={styles.statContent}>
          <h3>{overallStats.totalRequests}</h3>
          <p>Total Requests</p>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <TrendingUp size={24} />
        </div>
        <div className={styles.statContent}>
          <h3>{overallStats.approvalRate}%</h3>
          <p>Approval Rate</p>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <Clock size={24} />
        </div>
        <div className={styles.statContent}>
          <h3>{overallStats.averageDays}</h3>
          <p>Average Days</p>
        </div>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <Users size={24} />
        </div>
        <div className={styles.statContent}>
          <h3>{overallStats.totalDays}</h3>
          <p>Total Days Requested</p>
        </div>
      </div>
    </div>
  );

  const renderChart = () => (
    <div className={styles.chartContainer}>
      <h3>Monthly Request Trends</h3>
      <div className={styles.chart}>
        {chartData.map((data, index) => {
          const maxValue = Math.max(
            ...chartData.map(d => d.approved + d.rejected + d.pending)
          );
          // Calculate bar height for visual consistency
          
          return (
            <div key={index} className={styles.chartBar}>
              <div className={styles.barContainer} style={{ height: '200px' }}>
                <div 
                  className={styles.barSegment} 
                  style={{ 
                    height: `${(data.approved / maxValue) * 200}px`,
                    backgroundColor: '#10b981'
                  }}
                  title={`Approved: ${data.approved}`}
                />
                <div 
                  className={styles.barSegment} 
                  style={{ 
                    height: `${(data.pending / maxValue) * 200}px`,
                    backgroundColor: '#f59e0b'
                  }}
                  title={`Pending: ${data.pending}`}
                />
                <div 
                  className={styles.barSegment} 
                  style={{ 
                    height: `${(data.rejected / maxValue) * 200}px`,
                    backgroundColor: '#ef4444'
                  }}
                  title={`Rejected: ${data.rejected}`}
                />
              </div>
              <div className={styles.barLabel}>{data.month}</div>
            </div>
          );
        })}
      </div>
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }} />
          <span>Approved</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }} />
          <span>Pending</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }} />
          <span>Rejected</span>
        </div>
      </div>
    </div>
  );

  const renderDepartmentStats = () => (
    <div className={styles.tableContainer}>
      <h3>Department Statistics</h3>
      <table className={styles.statsTable}>
        <thead>
          <tr>
            <th>Department</th>
            <th>Total Requests</th>
            <th>Approved</th>
            <th>Rejected</th>
            <th>Pending</th>
            <th>Total Days</th>
            <th>Avg Days</th>
          </tr>
        </thead>
        <tbody>
          {departmentStats.map(stat => (
            <tr key={stat.department}>
              <td>{stat.department}</td>
              <td>{stat.totalRequests}</td>
              <td className={styles.approved}>{stat.approvedRequests}</td>
              <td className={styles.rejected}>{stat.rejectedRequests}</td>
              <td className={styles.pending}>{stat.pendingRequests}</td>
              <td>{stat.totalDays}</td>
              <td>{stat.averageDays}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEmployeeStats = () => (
    <div className={styles.tableContainer}>
      <h3>Top Employees by Vacation Days</h3>
      <table className={styles.statsTable}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Total Requests</th>
            <th>Total Days</th>
            <th>Avg Days</th>
            <th>Status Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {employeeStats.slice(0, 10).map(stat => (
            <tr key={stat.id}>
              <td>{stat.name}</td>
              <td>{stat.department}</td>
              <td>{stat.totalRequests}</td>
              <td>{stat.totalDays}</td>
              <td>{stat.averageDays}</td>
              <td>
                <div className={styles.statusBreakdown}>
                  <span className={styles.approved}>{stat.approvedRequests}A</span>
                  <span className={styles.pending}>{stat.pendingRequests}P</span>
                  <span className={styles.rejected}>{stat.rejectedRequests}R</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={styles.reportsAnalytics}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <BarChart size={24} />
          Reports & Analytics
        </h2>
        
        <div className={styles.headerActions}>
          <button onClick={exportReport} className={styles.exportButton}>
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>

          {hasPermission('view_reports') && (
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.viewTabs}>
          {['overview', 'departments', 'trends', 'employees'].map(view => (
            <button
              key={view}
              onClick={() => setReportView(view as any)}
              className={`${styles.tabButton} ${reportView === view ? styles.active : ''}`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {reportView === 'overview' && (
          <div className={styles.overviewContent}>
            {renderOverviewStats()}
            {renderChart()}
          </div>
        )}
        
        {reportView === 'departments' && renderDepartmentStats()}
        {reportView === 'trends' && renderChart()}
        {reportView === 'employees' && renderEmployeeStats()}
      </div>
    </div>
  );
};