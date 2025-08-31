import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, User, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Login.module.css';

interface LoginCredentials {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginCredentials>>({});

  const { login, isLoading, error } = useAuth();

  const demoAccounts = [
    {
      role: 'Admin',
      email: 'john.smith@company.com',
      password: 'admin123',
      icon: Shield,
      description: 'Full system access'
    },
    {
      role: 'Manager',
      email: 'sarah.johnson@company.com', 
      password: 'manager123',
      icon: Users,
      description: 'Team management'
    },
    {
      role: 'Employee',
      email: 'mike.chen@company.com',
      password: 'employee123',
      icon: User,
      description: 'Basic access'
    }
  ];

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};

    if (!credentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!credentials.password.trim()) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await login(credentials.email, credentials.password);
    if (!success) {
      // Error is handled by the auth context
      setCredentials(prev => ({ ...prev, password: '' }));
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleQuickLogin = (email: string, password: string) => {
    setCredentials({ email, password });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Team Vacation Calendar</h1>
          <p className={styles.loginSubtitle}>Sign in to manage your team's time off</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`${styles.input} ${fieldErrors.email ? styles.error : ''}`}
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <div className={styles.errorMessage}>{fieldErrors.email}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`${styles.input} ${styles.passwordInput} ${fieldErrors.password ? styles.error : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password && (
              <div className={styles.errorMessage}>{fieldErrors.password}</div>
            )}
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <>
                <div className={styles.loadingSpinner} />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className={styles.demoCredentials}>
          <h3 className={styles.demoTitle}>Demo Accounts</h3>
          {demoAccounts.map((account) => {
            const IconComponent = account.icon;
            return (
              <div key={account.email} className={styles.demoAccount}>
                <div className={styles.demoRole}>
                  <IconComponent size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {account.role} - {account.description}
                </div>
                <p className={styles.demoEmail}>{account.email}</p>
                <p className={styles.demoPassword}>Password: {account.password}</p>
                <div className={styles.quickLogin}>
                  <button
                    type="button"
                    className={styles.quickLoginButton}
                    onClick={() => handleQuickLogin(account.email, account.password)}
                    disabled={isLoading}
                  >
                    Quick Login
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};