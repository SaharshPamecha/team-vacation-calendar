import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TeamMember, AuthState, NotificationMessage } from '../types';
import { sampleTeamMembers } from '../data/mockData';

// Enhanced auth state interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<TeamMember>) => void;
  notifications: NotificationMessage[];
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<NotificationMessage, 'id' | 'timestamp'>) => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: TeamMember; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: TeamMember }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationMessage }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Enhanced auth state
interface EnhancedAuthState extends AuthState {
  notifications: NotificationMessage[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EnhancedAuthState = {
  isAuthenticated: false,
  user: null,
  token: undefined,
  notifications: [],
  isLoading: false,
  error: null
};

// Auth reducer
function authReducer(state: EnhancedAuthState, action: AuthAction): EnhancedAuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: undefined,
        isLoading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        notifications: state.notifications
      };
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, isRead: true } : notif
        )
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        if (parsedAuth.token && parsedAuth.user) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: parsedAuth.user,
              token: parsedAuth.token
            }
          });
        }
      } catch (error) {
        console.error('Failed to parse saved auth state:', error);
        localStorage.removeItem('authState');
      }
    }
  }, []);

  // Save auth state to localStorage
  useEffect(() => {
    if (state.isAuthenticated && state.user && state.token) {
      localStorage.setItem('authState', JSON.stringify({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }));
    } else {
      localStorage.removeItem('authState');
    }
  }, [state.isAuthenticated, state.user, state.token]);

  // Mock login function (replace with actual API call)
  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication - find user by email
    const user = sampleTeamMembers.find(member => 
      member.email.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      // Mock password validation (in real app, this would be handled by backend)
      const validPasswords: { [key: string]: string } = {
        'john.smith@company.com': 'admin123',
        'sarah.johnson@company.com': 'manager123',
        'mike.chen@company.com': 'employee123',
        'emily.davis@company.com': 'employee123',
        'david.wilson@company.com': 'employee123',
        'lisa.anderson@company.com': 'hr123'
      };

      if (validPasswords[user.email] === password) {
        // Generate mock JWT token
        const token = `mock-jwt-token-${Date.now()}-${user.id}`;
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });

        // Add welcome notification
        const welcomeNotification: NotificationMessage = {
          id: `notif-${Date.now()}`,
          type: 'success',
          title: 'Welcome Back!',
          message: `Successfully logged in as ${user.name}`,
          timestamp: new Date(),
          isRead: false
        };

        dispatch({ type: 'ADD_NOTIFICATION', payload: welcomeNotification });
        
        return true;
      }
    }

    dispatch({
      type: 'LOGIN_FAILURE',
      payload: 'Invalid email or password'
    });
    
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('authState');
    
    // Add logout notification
    const logoutNotification: NotificationMessage = {
      id: `notif-${Date.now()}`,
      type: 'info',
      title: 'Logged Out',
      message: 'You have been successfully logged out',
      timestamp: new Date(),
      isRead: false
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: logoutNotification });
  };

  const updateProfile = (userData: Partial<TeamMember>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      dispatch({ type: 'UPDATE_PROFILE', payload: updatedUser });
    }
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const addNotification = (notification: Omit<NotificationMessage, 'id' | 'timestamp'>) => {
    const fullNotification: NotificationMessage = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });
  };

  // Role-based permission system
  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;

    const rolePermissions: { [key: string]: string[] } = {
      'admin': [
        'view_all_requests',
        'approve_requests',
        'manage_users',
        'manage_departments',
        'view_reports',
        'export_data',
        'manage_holidays',
        'system_settings'
      ],
      'manager': [
        'view_team_requests',
        'approve_team_requests',
        'view_team_calendar',
        'export_team_data',
        'view_team_reports'
      ],
      'employee': [
        'create_request',
        'view_own_requests',
        'view_calendar',
        'update_profile'
      ]
    };

    const userPermissions = rolePermissions[state.user.role] || [];
    return userPermissions.includes(permission);
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateProfile,
    markNotificationRead,
    addNotification,
    hasPermission
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: string
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasPermission, user } = useAuth();

    if (!isAuthenticated || !user) {
      return <div>Please log in to access this page.</div>;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return <div>You don't have permission to access this page.</div>;
    }

    return <Component {...props} />;
  };
}