import React from 'react';
import { Filter, Download, Calendar, CheckCircle } from 'lucide-react';
import type { FilterOptions, TeamMember } from '../types';
import styles from '../styles/FilterPanel.module.css';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  teamMembers: TeamMember[];
  onExport: (format: string) => void;
  onNewRequest: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  teamMembers,
  onExport,
  onNewRequest
}) => {
  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const dateRange = filters.dateRange || { start: new Date(), end: new Date() };
    onFiltersChange({
      ...filters,
      dateRange: {
        ...dateRange,
        [field]: value ? new Date(value) : (field === 'start' ? new Date() : new Date())
      }
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const departments = [...new Set(teamMembers.map(member => member.department))];
  const statuses = ['pending', 'approved', 'rejected', 'cancelled'];
  const types = ['vacation', 'sick', 'personal', 'holiday'];

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <div className={styles.filterTitle}>
          <Filter size={20} />
          Filters & Actions
        </div>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={onNewRequest}
        >
          <Calendar size={16} />
          New Request
        </button>
      </div>

      <div className={styles.filterContent}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Department</label>
          <select
            className={styles.select}
            value={filters.department || ''}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Employee</label>
          <select
            className={styles.select}
            value={filters.employee || ''}
            onChange={(e) => handleFilterChange('employee', e.target.value)}
          >
            <option value="">All Employees</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Status</label>
          <select
            className={styles.select}
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Type</label>
          <select
            className={styles.select}
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Date Range</label>
          <div className={styles.dateRange}>
            <input
              type="date"
              className={styles.input}
              value={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              className={styles.input}
              value={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>

        <div className={styles.filterActions}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className={styles.exportSection}>
        <div className={styles.sectionTitle}>
          <Download size={16} />
          Export Options
        </div>
        <div className={styles.exportButtons}>
          <button
            className={`${styles.button} ${styles.buttonSecondary} ${styles.exportButton}`}
            onClick={() => onExport('csv')}
            title="Export as CSV"
          >
            CSV
          </button>
          <button
            className={`${styles.button} ${styles.buttonSecondary} ${styles.exportButton}`}
            onClick={() => onExport('json')}
            title="Export as JSON"
          >
            JSON
          </button>
          <button
            className={`${styles.button} ${styles.buttonSecondary} ${styles.exportButton}`}
            onClick={() => onExport('ical')}
            title="Export as iCal"
          >
            iCal
          </button>
          <button
            className={`${styles.button} ${styles.buttonSecondary} ${styles.exportButton}`}
            onClick={() => onExport('confluence')}
            title="Export for Confluence"
          >
            Confluence
          </button>
          <button
            className={`${styles.button} ${styles.buttonSecondary} ${styles.exportButton}`}
            onClick={() => onExport('jira')}
            title="Export for Jira"
          >
            Jira
          </button>
        </div>
      </div>

      <div className={styles.quickStats}>
        <div className={styles.sectionTitle}>
          <CheckCircle size={16} />
          Quick Stats
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {teamMembers.filter(m => m.isActive).length}
            </div>
            <div className={styles.statLabel}>Active Members</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {departments.length}
            </div>
            <div className={styles.statLabel}>Departments</div>
          </div>
        </div>
      </div>
    </div>
  );
};