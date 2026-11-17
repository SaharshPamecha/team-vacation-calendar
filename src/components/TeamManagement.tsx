import React, { useState, useMemo } from 'react';
import { Users, Building, UserPlus, Settings, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { TeamMember } from '../types';
import styles from '../styles/TeamManagement.module.css';

interface TeamManagementProps {
  teamMembers: TeamMember[];
  onUpdateTeamMembers: (members: TeamMember[]) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  teamMembers
  // onUpdateTeamMembers - available for future use
}) => {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'hierarchy' | 'schedule'>('overview');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Check permissions
  if (!hasPermission('view_team_requests') && !hasPermission('manage_users')) {
    return (
      <div className={styles.noPermission}>
        <Users size={48} />
        <h3>Access Denied</h3>
        <p>You don't have permission to view team management.</p>
      </div>
    );
  }

  // Mock departments data
  const departments = useMemo(() => [
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
    },
    {
      id: 'dept-4',
      name: 'HR',
      managerId: 'mgr-4',
      managerName: 'David Wilson',
      description: 'Human resources and administration',
      maxConcurrentLeave: 1,
      isActive: true
    }
  ], []);

  // Filter team members based on user role and permissions
  const visibleTeamMembers = useMemo(() => {
    if (hasPermission('manage_users')) {
      // Admins can see all team members
      return teamMembers;
    } else if (hasPermission('view_team_requests')) {
      // Managers can see their team members
      return teamMembers.filter(member => member.managerId === user?.id);
    }
    return [];
  }, [teamMembers, user, hasPermission]);

  // Calculate team statistics
  const teamStats = useMemo(() => {
    const filteredMembers = selectedDepartment === 'all' 
      ? visibleTeamMembers 
      : visibleTeamMembers.filter(member => member.department === selectedDepartment);

    const totalMembers = filteredMembers.length;
    const activeMembers = filteredMembers.filter(member => member.isActive).length;
    const managersCount = filteredMembers.filter(member => member.role === 'manager').length;
    const employeesCount = filteredMembers.filter(member => member.role === 'employee').length;

    return {
      totalMembers,
      activeMembers,
      managersCount,
      employeesCount,
      inactiveMembers: totalMembers - activeMembers
    };
  }, [visibleTeamMembers, selectedDepartment]);

  // Calculate department statistics
  const departmentStats = useMemo(() => {
    return departments.map(dept => {
      const deptMembers = visibleTeamMembers.filter(member => member.department === dept.name);
      return {
        ...dept,
        memberCount: deptMembers.length,
        activeMembers: deptMembers.filter(member => member.isActive).length,
        managers: deptMembers.filter(member => member.role === 'manager').length,
        employees: deptMembers.filter(member => member.role === 'employee').length
      };
    });
  }, [departments, visibleTeamMembers]);

  // Create organization hierarchy
  const organizationHierarchy = useMemo(() => {
    const hierarchy: any = {};
    
    // Group by managers
    visibleTeamMembers.forEach(member => {
      if (member.role === 'manager') {
        hierarchy[member.id] = {
          manager: member,
          team: visibleTeamMembers.filter(tm => tm.managerId === member.id)
        };
      }
    });

    return hierarchy;
  }, [visibleTeamMembers]);

  const renderOverview = () => (
    <div className={styles.overviewContent}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{teamStats.totalMembers}</h3>
            <p>Total Team Members</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <UserPlus size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{teamStats.activeMembers}</h3>
            <p>Active Members</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Settings size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{teamStats.managersCount}</h3>
            <p>Managers</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{departments.length}</h3>
            <p>Departments</p>
          </div>
        </div>
      </div>

      <div className={styles.teamMembersList}>
        <h3>Team Members</h3>
        <div className={styles.memberGrid}>
          {visibleTeamMembers
            .filter(member => selectedDepartment === 'all' || member.department === selectedDepartment)
            .map(member => (
              <div key={member.id} className={styles.memberCard}>
                <img
                  src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                  alt={member.name}
                  className={styles.memberAvatar}
                />
                <div className={styles.memberInfo}>
                  <h4>{member.name}</h4>
                  <p className={styles.memberTitle}>{member.jobTitle}</p>
                  <p className={styles.memberDepartment}>{member.department}</p>
                  <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  {!member.isActive && (
                    <span className={styles.inactiveBadge}>Inactive</span>
                  )}
                </div>
                <div className={styles.memberActions}>
                  <button className={styles.actionButton} title="View Profile">
                    <Users size={16} />
                  </button>
                  <button className={styles.actionButton} title="View Calendar">
                    <Calendar size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div className={styles.departmentsContent}>
      <div className={styles.departmentGrid}>
        {departmentStats.map(dept => (
          <div key={dept.id} className={styles.departmentCard}>
            <div className={styles.departmentHeader}>
              <div className={styles.departmentIcon}>
                <Building size={32} />
              </div>
              <div className={styles.departmentInfo}>
                <h3>{dept.name}</h3>
                <p>{dept.description}</p>
              </div>
              <div className={styles.departmentStatus}>
                <span className={`${styles.statusBadge} ${dept.isActive ? styles.active : styles.inactive}`}>
                  {dept.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className={styles.departmentStats}>
              <div className={styles.statRow}>
                <span>Manager:</span>
                <span>{dept.managerName}</span>
              </div>
              <div className={styles.statRow}>
                <span>Team Size:</span>
                <span>{dept.memberCount} members</span>
              </div>
              <div className={styles.statRow}>
                <span>Active Members:</span>
                <span>{dept.activeMembers}</span>
              </div>
              <div className={styles.statRow}>
                <span>Max Concurrent Leave:</span>
                <span>{dept.maxConcurrentLeave}</span>
              </div>
            </div>
            
            <div className={styles.departmentActions}>
              {hasPermission('manage_users') && (
                <>
                  <button className={styles.actionButton}>
                    <Settings size={16} />
                    Configure
                  </button>
                  <button className={styles.actionButton}>
                    <Users size={16} />
                    Manage Team
                  </button>
                </>
              )}
              <button className={styles.actionButton}>
                <Calendar size={16} />
                View Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHierarchy = () => (
    <div className={styles.hierarchyContent}>
      <h3>Organization Hierarchy</h3>
      <div className={styles.hierarchyTree}>
        {Object.values(organizationHierarchy).map((group: any) => (
          <div key={group.manager.id} className={styles.teamGroup}>
            <div className={styles.managerCard}>
              <img
                src={group.manager.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.manager.name)}&background=random`}
                alt={group.manager.name}
                className={styles.managerAvatar}
              />
              <div className={styles.managerInfo}>
                <h4>{group.manager.name}</h4>
                <p>{group.manager.jobTitle}</p>
                <p>{group.manager.department}</p>
                <span className={styles.managerBadge}>Manager</span>
              </div>
              <div className={styles.teamSize}>
                {group.team.length} team members
              </div>
            </div>
            
            {group.team.length > 0 && (
              <div className={styles.teamMembers}>
                {group.team.map((member: TeamMember) => (
                  <div key={member.id} className={styles.teamMemberItem}>
                    <img
                      src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
                      alt={member.name}
                      className={styles.teamMemberAvatar}
                    />
                    <div className={styles.teamMemberInfo}>
                      <span className={styles.teamMemberName}>{member.name}</span>
                      <span className={styles.teamMemberTitle}>{member.jobTitle}</span>
                    </div>
                    {!member.isActive && (
                      <AlertCircle size={16} className={styles.inactiveIcon} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className={styles.scheduleContent}>
      <h3>Team Schedule Overview</h3>
      <div className={styles.scheduleGrid}>
        {departmentStats.map(dept => (
          <div key={dept.id} className={styles.scheduleCard}>
            <div className={styles.scheduleHeader}>
              <h4>{dept.name}</h4>
              <span className={styles.memberCount}>{dept.activeMembers} active</span>
            </div>
            <div className={styles.scheduleInfo}>
              <div className={styles.scheduleItem}>
                <span>Available Today:</span>
                <span className={styles.available}>{dept.activeMembers}</span>
              </div>
              <div className={styles.scheduleItem}>
                <span>On Leave:</span>
                <span className={styles.onLeave}>0</span>
              </div>
              <div className={styles.scheduleItem}>
                <span>Max Concurrent:</span>
                <span>{dept.maxConcurrentLeave}</span>
              </div>
            </div>
            <div className={styles.scheduleActions}>
              <button className={styles.scheduleButton}>
                <Calendar size={16} />
                View Calendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.teamManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Users size={24} />
          Team Management
        </h2>
        
        <div className={styles.headerActions}>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className={styles.departmentFilter}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
          
          {hasPermission('manage_users') && (
            <button className={styles.addButton}>
              <UserPlus size={16} />
              Add Member
            </button>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        {['overview', 'departments', 'hierarchy', 'schedule'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'departments' && renderDepartments()}
        {activeTab === 'hierarchy' && renderHierarchy()}
        {activeTab === 'schedule' && renderSchedule()}
      </div>
    </div>
  );
};