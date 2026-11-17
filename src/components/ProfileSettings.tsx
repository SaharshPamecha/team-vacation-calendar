import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Briefcase, Shield, Save, Edit, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { TeamMember } from '../types';
import styles from '../styles/ProfileSettings.module.css';

interface ProfileSettingsProps {
  teamMembers: TeamMember[];
  onUpdateTeamMembers: (members: TeamMember[]) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  teamMembers,
  onUpdateTeamMembers
}) => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    jobTitle: user?.jobTitle || '',
    department: user?.department || '',
    startDate: user?.startDate ? new Date(user.startDate).toISOString().split('T')[0] : '',
    vacationDays: user?.vacationDays || 25
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailApprovals: true,
    emailReminders: true,
    emailSummaries: false,
    pushNotifications: true,
    smsNotifications: false
  });

  const [vacationStats] = useState({
    totalDays: user?.vacationDays || 25,
    usedDays: 12,
    remainingDays: (user?.vacationDays || 25) - 12,
    pendingDays: 3,
    year: new Date().getFullYear()
  });

  if (!user) {
    return (
      <div className={styles.noUser}>
        <User size={48} />
        <h3>No User Found</h3>
        <p>Please log in to view profile settings.</p>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedUser: TeamMember = {
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      jobTitle: formData.jobTitle,
      department: formData.department,
      startDate: formData.startDate ? new Date(formData.startDate) : user.startDate,
      vacationDays: formData.vacationDays
    };

    // Update in team members array
    const updatedMembers = teamMembers.map(member => 
      member.id === user.id ? updatedUser : member
    );
    
    onUpdateTeamMembers(updatedMembers);
    updateProfile(updatedUser);
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    
    // In a real app, this would call an API
    alert('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordChange(false);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'manager': return '#ea580c';
      case 'employee': return '#0891b2';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.profileSettings}>
      <div className={styles.header}>
        <h2 className={styles.title}>Profile Settings</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`${styles.editButton} ${isEditing ? styles.editing : ''}`}
        >
          <Edit size={16} />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className={styles.profileContainer}>
        {/* Profile Overview */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
              alt={user.name}
              className={styles.avatar}
            />
            <div className={styles.userInfo}>
              <h3>{user.name}</h3>
              <p className={styles.email}>{user.email}</p>
              <span
                className={styles.roleBadge}
                style={{ backgroundColor: getRoleBadgeColor(user.role) }}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>

          <div className={styles.profileStats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total Vacation Days</span>
              <span className={styles.statValue}>{vacationStats.totalDays}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Used Days</span>
              <span className={styles.statValue}>{vacationStats.usedDays}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Remaining Days</span>
              <span className={styles.statValue}>{vacationStats.remainingDays}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Pending Days</span>
              <span className={styles.statValue}>{vacationStats.pendingDays}</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className={styles.formCard}>
          <h4>Personal Information</h4>
          <form onSubmit={handleSaveProfile} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Briefcase size={16} />
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Software Engineer"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Shield size={16} />
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  disabled={true}
                  className={styles.readOnly}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Calendar size={16} />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Calendar size={16} />
                  Annual Vacation Days
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.vacationDays}
                  onChange={(e) => setFormData({ ...formData, vacationDays: parseInt(e.target.value) })}
                  disabled={!isEditing || user.role === 'employee'}
                  className={user.role === 'employee' ? styles.readOnly : ''}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Shield size={16} />
                  Role
                </label>
                <input
                  type="text"
                  value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  disabled={true}
                  className={styles.readOnly}
                />
              </div>
            </div>

            {isEditing && (
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Security Settings */}
        <div className={styles.formCard}>
          <div className={styles.sectionHeader}>
            <h4>Security Settings</h4>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className={styles.changePasswordButton}
            >
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordChange && (
            <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label>Current Password</label>
                <div className={styles.passwordInput}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={styles.passwordToggle}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>New Password</label>
                <div className={styles.passwordInput}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={styles.passwordToggle}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <div className={styles.passwordInput}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.passwordToggle}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.saveButton}>
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Notification Preferences */}
        <div className={styles.formCard}>
          <h4>Notification Preferences</h4>
          <div className={styles.notificationGrid}>
            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <span className={styles.notificationLabel}>Email Approval Notifications</span>
                <span className={styles.notificationDesc}>Receive emails when vacation requests are approved/rejected</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications.emailApprovals}
                  onChange={(e) => handleNotificationChange('emailApprovals', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <span className={styles.notificationLabel}>Email Reminders</span>
                <span className={styles.notificationDesc}>Receive reminder emails for upcoming vacations</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications.emailReminders}
                  onChange={(e) => handleNotificationChange('emailReminders', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <span className={styles.notificationLabel}>Weekly Email Summaries</span>
                <span className={styles.notificationDesc}>Receive weekly team vacation summaries</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications.emailSummaries}
                  onChange={(e) => handleNotificationChange('emailSummaries', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <span className={styles.notificationLabel}>Push Notifications</span>
                <span className={styles.notificationDesc}>Receive browser push notifications</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications.pushNotifications}
                  onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <span className={styles.notificationLabel}>SMS Notifications</span>
                <span className={styles.notificationDesc}>Receive text message notifications</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications.smsNotifications}
                  onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};