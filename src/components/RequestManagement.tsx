import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Check, X, Eye, Trash2, Download, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { VacationRequest, TeamMember } from '../types';
import { formatDateRange } from '../utils/dateUtils';
import styles from '../styles/RequestManagement.module.css';

interface RequestManagementProps {
  requests: VacationRequest[];
  teamMembers: TeamMember[];
  onUpdateRequest?: (request: VacationRequest) => void;
  onDeleteRequest: (requestId: string) => void;
  onApprove: (requestId: string, comments?: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onEditRequest: (request: VacationRequest) => void;
}

type SortField = 'startDate' | 'status' | 'employeeName' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const RequestManagement: React.FC<RequestManagementProps> = ({
  requests,
  teamMembers,
  onDeleteRequest,
  onApprove,
  onReject,
  onEditRequest
}) => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Get unique departments
  const departments = useMemo(() => {
    const depts = Array.from(new Set(teamMembers.map(member => member.department)));
    return depts.filter(Boolean);
  }, [teamMembers]);

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = requests.filter(request => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          request.employeeName.toLowerCase().includes(searchLower) ||
          request.reason?.toLowerCase().includes(searchLower) ||
          request.type.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter && request.status !== statusFilter) return false;

      // Type filter
      if (typeFilter && request.type !== typeFilter) return false;

      // Department filter
      if (departmentFilter) {
        const employee = teamMembers.find(m => m.id === request.employeeId);
        if (!employee || employee.department !== departmentFilter) return false;
      }

      // Date range filter
      if (dateRangeFilter.start && dateRangeFilter.end) {
        const requestStart = new Date(request.startDate);
        const requestEnd = new Date(request.endDate);
        const filterStart = new Date(dateRangeFilter.start);
        const filterEnd = new Date(dateRangeFilter.end);
        
        const overlaps = requestStart <= filterEnd && requestEnd >= filterStart;
        if (!overlaps) return false;
      }

      // Permission-based filtering
      if (user?.role === 'manager') {
        const employee = teamMembers.find(m => m.id === request.employeeId);
        if (!employee || employee.managerId !== user.id) return false;
      } else if (user?.role === 'employee') {
        if (request.employeeId !== user.id) return false;
      }

      return true;
    });

    // Sort requests
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'employeeName':
          aValue = a.employeeName;
          bValue = b.employeeName;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.startDate;
          bValue = b.startDate;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [requests, teamMembers, searchTerm, statusFilter, typeFilter, departmentFilter, dateRangeFilter, sortField, sortDirection, user]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredAndSortedRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredAndSortedRequests.map(req => req.id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedRequests.length === 0) return;

    switch (action) {
      case 'approve':
        if (hasPermission('approve_requests') || hasPermission('approve_team_requests')) {
          selectedRequests.forEach(requestId => onApprove(requestId));
          setSelectedRequests([]);
        }
        break;
      case 'reject':
        if (hasPermission('approve_requests') || hasPermission('approve_team_requests')) {
          const reason = prompt('Enter rejection reason:');
          if (reason) {
            selectedRequests.forEach(requestId => onReject(requestId, reason));
            setSelectedRequests([]);
          }
        }
        break;
      case 'delete':
        if (hasPermission('manage_requests')) {
          if (confirm(`Are you sure you want to delete ${selectedRequests.length} request(s)?`)) {
            selectedRequests.forEach(requestId => onDeleteRequest(requestId));
            setSelectedRequests([]);
          }
        }
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <X size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const calculateWorkingDays = (startDate: Date, endDate: Date) => {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  const exportRequests = () => {
    const csvData = filteredAndSortedRequests.map(request => ({
      Employee: request.employeeName,
      Type: request.type,
      'Start Date': new Date(request.startDate).toLocaleDateString(),
      'End Date': new Date(request.endDate).toLocaleDateString(),
      Status: request.status,
      Reason: request.reason || '',
      'Working Days': calculateWorkingDays(new Date(request.startDate), new Date(request.endDate)),
      'Created Date': new Date(request.createdAt).toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vacation-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderTableView = () => (
    <div className={styles.tableContainer}>
      <table className={styles.requestsTable}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRequests.length === filteredAndSortedRequests.length && filteredAndSortedRequests.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th onClick={() => handleSort('employeeName')} className={styles.sortableHeader}>
              Employee
              {sortField === 'employeeName' && (
                sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </th>
            <th>Type</th>
            <th onClick={() => handleSort('startDate')} className={styles.sortableHeader}>
              Dates
              {sortField === 'startDate' && (
                sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </th>
            <th>Days</th>
            <th onClick={() => handleSort('status')} className={styles.sortableHeader}>
              Status
              {sortField === 'status' && (
                sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </th>
            <th onClick={() => handleSort('createdAt')} className={styles.sortableHeader}>
              Submitted
              {sortField === 'createdAt' && (
                sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              )}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedRequests.map(request => {
            const workingDays = calculateWorkingDays(new Date(request.startDate), new Date(request.endDate));
            return (
              <tr key={request.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleSelectRequest(request.id)}
                  />
                </td>
                <td>
                  <div className={styles.employeeCell}>
                    <div className={styles.employeeName}>{request.employeeName}</div>
                    <div className={styles.employeeDept}>
                      {teamMembers.find(m => m.id === request.employeeId)?.department}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.typeBadge} ${styles[request.type]}`}>
                    {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                  </span>
                </td>
                <td>
                  <div className={styles.dateRange}>
                    {formatDateRange(new Date(request.startDate), new Date(request.endDate))}
                  </div>
                </td>
                <td>{workingDays}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {getStatusIcon(request.status)}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => onEditRequest(request)}
                      className={styles.actionButton}
                      title="View/Edit"
                    >
                      <Eye size={16} />
                    </button>
                    {(hasPermission('approve_requests') || hasPermission('approve_team_requests')) && 
                     request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(request.id)}
                          className={`${styles.actionButton} ${styles.approveButton}`}
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => onReject(request.id, 'Rejected by manager')}
                          className={`${styles.actionButton} ${styles.rejectButton}`}
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {hasPermission('manage_requests') && (
                      <button
                        onClick={() => onDeleteRequest(request.id)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div className={styles.cardsContainer}>
      {filteredAndSortedRequests.map(request => {
        const workingDays = calculateWorkingDays(new Date(request.startDate), new Date(request.endDate));
        return (
          <div key={request.id} className={styles.requestCard}>
            <div className={styles.cardHeader}>
              <div className={styles.employeeInfo}>
                <h4>{request.employeeName}</h4>
                <span className={styles.department}>
                  {teamMembers.find(m => m.id === request.employeeId)?.department}
                </span>
              </div>
              <span
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(request.status) }}
              >
                {getStatusIcon(request.status)}
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
            
            <div className={styles.cardContent}>
              <div className={styles.requestDetail}>
                <Calendar size={16} />
                <span>{formatDateRange(new Date(request.startDate), new Date(request.endDate))}</span>
                <span className={styles.duration}>({workingDays} days)</span>
              </div>
              
              <div className={styles.requestDetail}>
                <span className={`${styles.typeBadge} ${styles[request.type]}`}>
                  {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                </span>
              </div>
              
              {request.reason && (
                <div className={styles.requestReason}>
                  <p>{request.reason}</p>
                </div>
              )}
            </div>
            
            <div className={styles.cardActions}>
              <button
                onClick={() => onEditRequest(request)}
                className={styles.actionButton}
              >
                <Eye size={16} />
                View
              </button>
              {(hasPermission('approve_requests') || hasPermission('approve_team_requests')) && 
               request.status === 'pending' && (
                <>
                  <button
                    onClick={() => onApprove(request.id)}
                    className={`${styles.actionButton} ${styles.approveButton}`}
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(request.id, 'Rejected by manager')}
                    className={`${styles.actionButton} ${styles.rejectButton}`}
                  >
                    <X size={16} />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.requestManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>Request Management</h2>
        
        <div className={styles.headerActions}>
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            className={styles.viewToggle}
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
          
          <button
            onClick={exportRequests}
            className={styles.exportButton}
            disabled={filteredAndSortedRequests.length === 0}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchAndFilters}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {selectedRequests.length > 0 && (
          <div className={styles.bulkActions}>
            <span>{selectedRequests.length} selected</span>
            {(hasPermission('approve_requests') || hasPermission('approve_team_requests')) && (
              <>
                <button
                  onClick={() => handleBulkAction('approve')}
                  className={styles.bulkApprove}
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className={styles.bulkReject}
                >
                  Reject All
                </button>
              </>
            )}
            {hasPermission('manage_requests') && (
              <button
                onClick={() => handleBulkAction('delete')}
                className={styles.bulkDelete}
              >
                Delete All
              </button>
            )}
          </div>
        )}
      </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Types</option>
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="maternity">Maternity</option>
            <option value="paternity">Paternity</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <div className={styles.dateRangeFilter}>
            <input
              type="date"
              value={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
              className={styles.dateInput}
              placeholder="Start date"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRangeFilter.end}
              onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
              className={styles.dateInput}
              placeholder="End date"
            />
          </div>

          <button
            onClick={() => {
              setStatusFilter('');
              setTypeFilter('');
              setDepartmentFilter('');
              setDateRangeFilter({ start: '', end: '' });
              setSearchTerm('');
            }}
            className={styles.clearFilters}
          >
            Clear All
          </button>
        </div>
      )}

      <div className={styles.summary}>
        <span>Showing {filteredAndSortedRequests.length} of {requests.length} requests</span>
      </div>

      <div className={styles.content}>
        {filteredAndSortedRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} />
            <h3>No requests found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          viewMode === 'table' ? renderTableView() : renderCardView()
        )}
      </div>
    </div>
  );
};