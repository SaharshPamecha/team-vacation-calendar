import React, { useState } from 'react';
import { User, Bell, LogOut, Calendar, Users, FileText, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Navigation.module.css';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const { user, logout, notifications, hasPermission } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'calendar', label: 'Calendar', icon: Calendar, permission: 'view_calendar' },
    { id: 'requests', label: 'Requests', icon: FileText, permission: 'view_own_requests' },
    { id: 'team', label: 'Team', icon: Users, permission: 'view_team_requests' },
    { id: 'reports', label: 'Reports', icon: BarChart3, permission: 'view_reports' },
    { id: 'admin', label: 'Admin', icon: Settings, permission: 'manage_users' }
  ];

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) return null;

  return (
    <nav className={styles.navigation}>
      <div className={styles.navContainer}>
        <div className={styles.navBrand}>
          <Calendar size={32} />
          <span>Team Vacation Calendar</span>
        </div>

        <div className={styles.navItems}>
          {filteredNavItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`${styles.navItem} ${currentPage === item.id ? styles.active : ''}`}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.navRight}>
          <button className={styles.notificationButton}>
            <Bell size={20} />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>

          <div className={styles.userMenu}>
            <button 
              className={styles.userButton}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User size={20} />
              <span>{user.name}</span>
            </button>

            {showUserMenu && (
              <div className={styles.userDropdown}>
                <button onClick={() => onPageChange('profile')}>
                  <User size={16} /> Profile
                </button>
                <button onClick={logout} className={styles.logoutBtn}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};