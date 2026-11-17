import React, { useState } from 'react';
import { Check, X, Clock, MessageSquare, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { VacationRequest, TeamMember } from '../types';
import { formatDateRange } from '../utils/dateUtils';
import styles from '../styles/ApprovalWorkflow.module.css';

interface ApprovalWorkflowProps {
  requests: VacationRequest[];
  teamMembers: TeamMember[];
  onApprove: (requestId: string, comments?: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onUpdateRequest?: (request: VacationRequest) => void;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  requests,
  teamMembers,
  onApprove,
  onReject
}) => {
  const { user, hasPermission } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterDepartment, setFilterDepartment] = useState<string>('');

  // Get requests that the current user can approve
  const getApprovableRequests = () => {
    if (!user) return [];

    return requests.filter(request => {
      // Admins can approve all requests
      if (user.role === 'admin') return true;

      // Managers can approve their team members' requests
      if (user.role === 'manager') {
        const employee = teamMembers.find(member => member.id === request.employeeId);
        return employee?.managerId === user.id;
      }

      return false;
    });
  };

  // Filter requests based on current filters
  const filteredRequests = getApprovableRequests().filter(request => {
    if (filterStatus && request.status !== filterStatus) return false;
    
    if (filterDepartment) {
      const employee = teamMembers.find(member => member.id === request.employeeId);
      if (employee?.department !== filterDepartment) return false;
    }

    return true;
  });

  // Get unique departments for filter
  const departments = [...new Set(teamMembers.map(member => member.department))];

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === 'approve') {
      onApprove(selectedRequest.id, comments);
    } else {
      if (!comments.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      onReject(selectedRequest.id, comments);
    }

    // Reset form
    setSelectedRequest(null);
    setActionType(null);
    setComments('');
  };

  const getRequestEmployee = (employeeId: string) => {
    return teamMembers.find(member => member.id === employeeId);
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
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  if (!hasPermission('approve_requests') && !hasPermission('approve_team_requests')) {
    return (
      <div className={styles.noPermission}>
        <h3>Access Denied</h3>
        <p>You don't have permission to approve vacation requests.</p>
      </div>
    );
  }

  return (
    <div className={styles.approvalWorkflow}>
      <div className={styles.header}>
        <h2 className={styles.title}>Vacation Request Approvals</h2>
        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.requestsList}>
        {filteredRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} />
            <h3>No Requests Found</h3>
            <p>There are no vacation requests matching your current filters.</p>
          </div>
        ) : (
          filteredRequests.map(request => {
            const employee = getRequestEmployee(request.employeeId);
            const workingDays = calculateWorkingDays(new Date(request.startDate), new Date(request.endDate));
            
            return (
              <div key={request.id} className={styles.requestCard}>
                <div className={styles.requestHeader}>
                  <div className={styles.employeeInfo}>
                    <div className={styles.employeeName}>
                      <User size={16} />
                      {request.employeeName}
                    </div>
                    <div className={styles.employeeDetails}>
                      {employee?.department} • {employee?.jobTitle}
                    </div>
                  </div>
                  
                  <div className={styles.requestStatus}>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(request.status) }}
                    >
                      {getStatusIcon(request.status)}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className={styles.requestDetails}>
                  <div className={styles.dateRange}>
                    <Calendar size={16} />
                    <span>{formatDateRange(new Date(request.startDate), new Date(request.endDate))}</span>
                    <span className={styles.duration}>({workingDays} working days)</span>
                  </div>
                  
                  <div className={styles.requestType}>
                    <span className={`${styles.typeBadge} ${styles[request.type]}`}>
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                    </span>
                  </div>
                </div>

                {request.reason && (
                  <div className={styles.requestReason}>
                    <MessageSquare size={16} />
                    <span>{request.reason}</span>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className={styles.actionButtons}>
                    <button
                      className={`${styles.actionButton} ${styles.approveButton}`}
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionType('approve');
                      }}
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    
                    <button
                      className={`${styles.actionButton} ${styles.rejectButton}`}
                      onClick={() => {
                        setSelectedRequest(request);
                        setActionType('reject');
                      }}
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                )}

                {request.status === 'approved' && request.approvedBy && (
                  <div className={styles.approvalInfo}>
                    <span>Approved by {request.approvedBy}</span>
                    {request.approvedAt && (
                      <span> on {new Date(request.approvedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                {request.status === 'rejected' && request.rejectedBy && (
                  <div className={styles.rejectionInfo}>
                    <span>Rejected by {request.rejectedBy}</span>
                    {request.rejectedAt && (
                      <span> on {new Date(request.rejectedAt).toLocaleDateString()}</span>
                    )}
                    {request.rejectionReason && (
                      <div className={styles.rejectionReason}>
                        Reason: {request.rejectionReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Action Modal */}
      {selectedRequest && actionType && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                {actionType === 'approve' ? 'Approve' : 'Reject'} Vacation Request
              </h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                  setComments('');
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.requestSummary}>
                <h4>{selectedRequest.employeeName}</h4>
                <p>{formatDateRange(new Date(selectedRequest.startDate), new Date(selectedRequest.endDate))}</p>
                <p>Type: {selectedRequest.type}</p>
                {selectedRequest.reason && <p>Reason: {selectedRequest.reason}</p>}
              </div>

              <div className={styles.commentsSection}>
                <label className={styles.label}>
                  {actionType === 'approve' ? 'Comments (optional)' : 'Rejection Reason *'}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    actionType === 'approve' 
                      ? 'Add any comments for this approval...'
                      : 'Please provide a reason for rejection...'
                  }
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                  setComments('');
                }}
              >
                Cancel
              </button>
              
              <button
                className={`${styles.button} ${
                  actionType === 'approve' ? styles.buttonApprove : styles.buttonReject
                }`}
                onClick={handleAction}
              >
                {actionType === 'approve' ? (
                  <>
                    <Check size={16} />
                    Approve Request
                  </>
                ) : (
                  <>
                    <X size={16} />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};