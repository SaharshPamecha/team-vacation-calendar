import React, { useState } from 'react';
import { Edit, Trash2, Search, UserPlus, Shield, Users, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { TeamMember, Department } from '../types';
import styles from '../styles/UserManagement.module.css';

interface UserManagementProps {
  teamMembers: TeamMember[];
  onUpdateTeamMembers: (members: TeamMember[]) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  teamMembers,
  onUpdateTeamMembers
}) => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentView, setCurrentView] = useState<'users' | 'departments'>('users');

  // Mock departments data
  const [departments] = useState<Department[]>([
    {
      id: 'dept-1',
      name: 'Engineering',
      managerId: 'mgr-1',
      managerName: 'Alice Johnson',
      description: 'Software development and technical infrastructure',
      maxConcurrentLeave: 3,
      isActive: true
    },
    {
      id: 'dept-2',
      name: 'Marketing',
      managerId: 'mgr-2',
      managerName: 'Bob Smith',
      description: 'Marketing and brand management',
      maxConcurrentLeave: 2,
      isActive: true
    },
    {
      id: 'dept-3',
      name: 'Sales',
      managerId: 'mgr-3',
      managerName: 'Carol Davis',
      description: 'Sales and customer relations',
      maxConcurrentLeave: 2,
      isActive: true
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: '',
    jobTitle: '',
    managerId: '',
    phone: '',
    startDate: '',
    vacationDays: 25,
    isActive: true
  });

  // Check permissions
  if (!hasPermission('manage_users')) {
    return (
      <div className={styles.noPermission}>
        <Shield size={48} />
        <h3>Access Denied</h3>
        <p>You don't have permission to manage users.</p>
      </div>
    );
  }

  // Filter users based on search and filters
  const filteredUsers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || member.role === filterRole;
    const matchesDepartment = !filterDepartment || member.department === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      department: '',
      jobTitle: '',
      managerId: '',
      phone: '',
      startDate: '',
      vacationDays: 25,
      isActive: true
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditUser = (member: TeamMember) => {
    setSelectedUser(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      jobTitle: member.jobTitle || '',
      managerId: member.managerId || '',
      phone: member.phone || '',
      startDate: member.startDate ? new Date(member.startDate).toISOString().split('T')[0] : '',
      vacationDays: member.vacationDays || 25,
      isActive: member.isActive !== false
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteUser = (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedMembers = teamMembers.filter(member => member.id !== memberId);
      onUpdateTeamMembers(updatedMembers);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData: TeamMember = {
      id: selectedUser?.id || `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      jobTitle: formData.jobTitle,
      managerId: formData.managerId || undefined,
      phone: formData.phone || undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      vacationDays: formData.vacationDays,
      isActive: formData.isActive,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
    };

    if (modalMode === 'create') {
      onUpdateTeamMembers([...teamMembers, userData]);
    } else {
      const updatedMembers = teamMembers.map(member => 
        member.id === selectedUser?.id ? userData : member
      );
      onUpdateTeamMembers(updatedMembers);
    }

    setIsModalOpen(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'manager': return '#ea580c';
      case 'employee': return '#0891b2';
      default: return '#6b7280';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? '#10b981' : '#6b7280';
  };

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Users size={24} />
          User Management
        </h2>
        
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleButton} ${currentView === 'users' ? styles.active : ''}`}
            onClick={() => setCurrentView('users')}
          >
            <Users size={16} />
            Users
          </button>
          <button
            className={`${styles.toggleButton} ${currentView === 'departments' ? styles.active : ''}`}
            onClick={() => setCurrentView('departments')}
          >
            <Building size={16} />
            Departments
          </button>
        </div>
      </div>

      {currentView === 'users' && (
        <>
          <div className={styles.controls}>
            <div className={styles.searchAndFilters}>
              <div className={styles.searchBox}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
              
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleCreateUser}
              className={styles.createButton}
            >
              <UserPlus size={16} />
              Add User
            </button>
          </div>

          <div className={styles.usersList}>
            <div className={styles.tableHeader}>
              <span>User</span>
              <span>Role</span>
              <span>Department</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            
            {filteredUsers.map(member => (
              <div key={member.id} className={styles.userRow}>
                <div className={styles.userInfo}>
                  <img
                    src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                    alt={member.name}
                    className={styles.avatar}
                  />
                  <div>
                    <div className={styles.userName}>{member.name}</div>
                    <div className={styles.userEmail}>{member.email}</div>
                  </div>
                </div>
                
                <span
                  className={styles.roleBadge}
                  style={{ backgroundColor: getRoleBadgeColor(member.role) }}
                >
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                
                <span className={styles.department}>{member.department}</span>
                
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusBadgeColor(member.isActive !== false) }}
                >
                  {member.isActive !== false ? 'Active' : 'Inactive'}
                </span>
                
                <div className={styles.actions}>
                  <button
                    onClick={() => handleEditUser(member)}
                    className={styles.editButton}
                    title="Edit user"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(member.id)}
                    className={styles.deleteButton}
                    title="Delete user"
                    disabled={member.id === user?.id}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {currentView === 'departments' && (
        <div className={styles.departmentsList}>
          <div className={styles.departmentGrid}>
            {departments.map(dept => (
              <div key={dept.id} className={styles.departmentCard}>
                <div className={styles.departmentHeader}>
                  <h3>{dept.name}</h3>
                  <span className={`${styles.statusBadge} ${dept.isActive ? styles.active : styles.inactive}`}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className={styles.departmentDescription}>{dept.description}</p>
                <div className={styles.departmentStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Manager:</span>
                    <span className={styles.statValue}>{dept.managerName}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Max Concurrent Leave:</span>
                    <span className={styles.statValue}>{dept.maxConcurrentLeave}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Team Size:</span>
                    <span className={styles.statValue}>
                      {teamMembers.filter(m => m.department === dept.name).length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Vacation Days</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.vacationDays}
                    onChange={(e) => setFormData({...formData, vacationDays: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Active User
                </label>
              </div>
              
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};