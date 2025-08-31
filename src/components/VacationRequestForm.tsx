import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import type { VacationRequest, TeamMember } from '../types';
import { dateUtils } from '../utils/dateUtils';
import styles from '../styles/VacationRequestForm.module.css';

interface VacationRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<VacationRequest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  currentUser: TeamMember;
  initialDate?: Date;
  existingRequest?: VacationRequest;
}

export const VacationRequestForm: React.FC<VacationRequestFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  initialDate,
  existingRequest
}) => {
  const [formData, setFormData] = useState({
    startDate: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
    endDate: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
    type: 'vacation' as 'vacation' | 'sick' | 'personal' | 'holiday',
    reason: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'cancelled'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingRequest) {
      setFormData({
        startDate: format(new Date(existingRequest.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(existingRequest.endDate), 'yyyy-MM-dd'),
        type: existingRequest.type,
        reason: existingRequest.reason || '',
        status: existingRequest.status
      });
    } else if (initialDate) {
      const dateStr = format(initialDate, 'yyyy-MM-dd');
      setFormData(prev => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr
      }));
    }
  }, [existingRequest, initialDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate > endDate) {
        newErrors.endDate = 'End date must be after start date';
      }

      // Check if dates are in the past (except for sick leave)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (formData.type !== 'sick' && startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }

      // Check for reasonable vacation length (max 30 days for vacation)
      const duration = dateUtils.getVacationDuration(startDate, endDate);
      if (formData.type === 'vacation' && duration > 30) {
        newErrors.endDate = 'Vacation cannot exceed 30 days';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: Omit<VacationRequest, 'id' | 'createdAt' | 'updatedAt'> = {
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        type: formData.type,
        status: formData.status,
        reason: formData.reason.trim()
      };

      await onSubmit(requestData);
      onClose();
      
      // Reset form
      setFormData({
        startDate: '',
        endDate: '',
        type: 'vacation',
        reason: '',
        status: 'pending'
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting vacation request:', error);
      setErrors({ general: 'Failed to submit request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-update end date when start date changes
    if (field === 'startDate' && value && !formData.endDate) {
      setFormData(prev => ({ ...prev, endDate: value }));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getVacationDuration = () => {
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      return dateUtils.getVacationDuration(startDate, endDate);
    }
    return 0;
  };

  const vacationTypes = [
    { value: 'vacation', label: 'Vacation', icon: Calendar },
    { value: 'sick', label: 'Sick Leave', icon: Clock },
    { value: 'personal', label: 'Personal', icon: User },
    { value: 'holiday', label: 'Holiday', icon: Calendar }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.formOverlay} onClick={handleOverlayClick}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            {existingRequest ? 'Edit Vacation Request' : 'New Vacation Request'}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            {errors.general && (
              <div className={styles.errorMessage}>{errors.general}</div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Type <span className={styles.required}>*</span>
              </label>
              <div className={styles.typeButtons}>
                {vacationTypes.map(type => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      className={`${styles.typeButton} ${
                        formData.type === type.value ? styles.selected : ''
                      }`}
                      onClick={() => handleInputChange('type', type.value)}
                    >
                      <IconComponent className={styles.typeIcon} />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Dates <span className={styles.required}>*</span>
              </label>
              <div className={styles.dateInputGroup}>
                <div>
                  <input
                    type="date"
                    className={styles.input}
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    placeholder="Start Date"
                    min={formData.type === 'sick' ? undefined : format(new Date(), 'yyyy-MM-dd')}
                  />
                  {errors.startDate && (
                    <div className={styles.errorMessage}>{errors.startDate}</div>
                  )}
                </div>
                <div>
                  <input
                    type="date"
                    className={styles.input}
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    placeholder="End Date"
                    min={formData.startDate || (formData.type === 'sick' ? undefined : format(new Date(), 'yyyy-MM-dd'))}
                  />
                  {errors.endDate && (
                    <div className={styles.errorMessage}>{errors.endDate}</div>
                  )}
                </div>
              </div>
              
              {formData.startDate && formData.endDate && (
                <div className={styles.durationDisplay}>
                  <p className={styles.durationText}>Duration</p>
                  <p className={styles.durationDays}>
                    {getVacationDuration()} {getVacationDuration() === 1 ? 'day' : 'days'}
                  </p>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="reason">
                Reason <span className={styles.required}>*</span>
              </label>
              <textarea
                id="reason"
                className={styles.textarea}
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Please provide a reason for your request..."
                rows={3}
              />
              {errors.reason && (
                <div className={styles.errorMessage}>{errors.reason}</div>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={isSubmitting}
            >
              {isSubmitting && <div className={styles.loadingSpinner} />}
              {existingRequest ? 'Update Request' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};