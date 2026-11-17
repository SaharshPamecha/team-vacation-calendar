import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { NotificationMessage } from '../types';
import styles from '../styles/NotificationSystem.module.css';

interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  autoHideDelay?: number;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  position = 'top-right',
  maxNotifications = 5,
  autoHideDelay = 5000
}) => {
  const { notifications, markNotificationRead } = useAuth();
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationMessage[]>([]);

  useEffect(() => {
    // Show only unread notifications, limited by maxNotifications
    const unreadNotifications = notifications
      .filter(notification => !notification.isRead)
      .slice(0, maxNotifications)
      .reverse(); // Show newest first

    setVisibleNotifications(unreadNotifications);
  }, [notifications, maxNotifications]);

  useEffect(() => {
    // Auto-hide notifications after delay
    visibleNotifications.forEach(notification => {
      if (autoHideDelay > 0) {
        const timer = setTimeout(() => {
          handleDismiss(notification.id);
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    });
  }, [visibleNotifications, autoHideDelay]);

  const handleDismiss = (id: string) => {
    markNotificationRead(id);
  };

  const getNotificationIcon = (type: NotificationMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  const getNotificationClass = (type: NotificationMessage['type']) => {
    return `${styles.notification} ${styles[type]}`;
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.notificationContainer} ${styles[position]}`}>
      {visibleNotifications.map(notification => (
        <div
          key={notification.id}
          className={getNotificationClass(notification.type)}
        >
          <div className={styles.notificationIcon}>
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className={styles.notificationContent}>
            <div className={styles.notificationTitle}>
              {notification.title}
            </div>
            <div className={styles.notificationMessage}>
              {notification.message}
            </div>
            {notification.actionUrl && (
              <button 
                className={styles.notificationAction}
                onClick={() => window.location.href = notification.actionUrl!}
              >
                {notification.actionText || 'View'}
              </button>
            )}
          </div>

          <button
            className={styles.dismissButton}
            onClick={() => handleDismiss(notification.id)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Hook for creating notifications
export const useNotifications = () => {
  const { notifications } = useAuth();

  const createNotification = (
    type: NotificationMessage['type'],
    title: string,
    message: string,
    options?: {
      actionText?: string;
      actionUrl?: string;
      persistent?: boolean;
    }
  ): NotificationMessage => {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      actionText: options?.actionText,
      actionUrl: options?.actionUrl,
      persistent: options?.persistent || false
    };
  };

  const showSuccess = (title: string, message: string, options?: { actionText?: string; actionUrl?: string }) => {
    return createNotification('success', title, message, options);
  };

  const showError = (title: string, message: string, options?: { actionText?: string; actionUrl?: string }) => {
    return createNotification('error', title, message, options);
  };

  const showWarning = (title: string, message: string, options?: { actionText?: string; actionUrl?: string }) => {
    return createNotification('warning', title, message, options);
  };

  const showInfo = (title: string, message: string, options?: { actionText?: string; actionUrl?: string }) => {
    return createNotification('info', title, message, options);
  };

  return {
    notifications,
    createNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};