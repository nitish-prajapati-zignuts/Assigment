'use client';

/**
 * Error Notification Component
 * Displays errors as non-blocking toast notifications
 * Automatically dismisses after a timeout
 */

import React, { useState, useCallback, useEffect } from 'react';
import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle, X } from 'lucide-react';

export type NotificationType = 'error' | 'success' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // ms, 0 = no auto-dismiss
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

/**
 * Hook to use notifications
 */
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

/**
 * Notification Provider
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications((prev) => [...prev, fullNotification]);

    // Auto-dismiss if duration is set
    if (fullNotification.duration! > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, fullNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Listen for global custom notification events (e.g., from axios interceptors)
  useEffect(() => {
    const handleCustomNotification = (event: Event) => {
      const customEvent = event as CustomEvent<Omit<Notification, "id">>;
      if (customEvent.detail) {
        addNotification(customEvent.detail);
      }
    };

    window.addEventListener("app-notification", handleCustomNotification);
    return () => {
      window.removeEventListener("app-notification", handleCustomNotification);
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

/**
 * Notification Container
 * Renders all active notifications
 */
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

/**
 * Individual Notification Item
 */
const NotificationItem: React.FC<{
  notification: Notification;
  onDismiss: () => void;
}> = ({ notification, onDismiss }) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <InfoIcon className="w-5 h-5" />;
    }
  };

  const getStyles = (type: NotificationType) => {
    const baseStyles = 'rounded-lg shadow-lg p-4 backdrop-blur-sm border';
    switch (type) {
      case 'error':
        return `${baseStyles} bg-red-500/90 border-red-600 text-white`;
      case 'success':
        return `${baseStyles} bg-green-500/90 border-green-600 text-white`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/90 border-yellow-600 text-white`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-500/90 border-blue-600 text-white`;
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'error':
      case 'success':
      case 'warning':
      case 'info':
      default:
        return 'currentColor';
    }
  };

  return (
    <div
      className={`${getStyles(notification.type)} flex items-start gap-3 animate-in slide-in-from-right-5 fade-in duration-300`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {React.cloneElement(getIcon(notification.type), { color: getIconColor(notification.type) })}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm">{notification.title}</h3>
        <p className="text-xs opacity-90 mt-1">{notification.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
